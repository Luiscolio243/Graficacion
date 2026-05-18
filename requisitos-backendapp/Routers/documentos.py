from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime
from db import engine
from Models.AnalisisDocumento import AnalisisDocumento
from Models.DocumentoAnalizado import DocumentoAnalizado
from Models.HallazgoAnalisis import HallazgoAnalisis
from sqlalchemy.exc import SQLAlchemyError

documentos_router = Blueprint('documentos', __name__)


def serializar_analisis(a: AnalisisDocumento, session: Session) -> dict:
    proceso_nombre    = None
    subproceso_nombre = None

    if a.id_proceso:
        from Models.Proceso import Proceso
        p = session.get(Proceso, a.id_proceso)
        if p:
            proceso_nombre = p.nombre

    if a.id_subproceso:
        from Models.Subproceso import Subproceso
        s = session.get(Subproceso, a.id_subproceso)
        if s:
            subproceso_nombre = s.nombre

    return {
        'id_analisis':       a.id_analisis,
        'id_proyecto':       a.id_proyecto,
        'titulo':            a.titulo,
        'tipo_documento':    a.tipo_documento,
        'fuente':            a.fuente,
        'id_proceso':        a.id_proceso,
        'proceso_nombre':    proceso_nombre,
        'id_subproceso':     a.id_subproceso,
        'subproceso_nombre': subproceso_nombre,
        'recomendaciones':   a.recomendaciones,
        'fecha_creacion':    a.fecha_creacion.strftime('%d/%m/%Y') if a.fecha_creacion else None,
        'documentos': [
            {
                'id_documento': d.id_documento,
                'nombre':       d.nombre,
                'tipo':         d.tipo,
                'url':          d.url,
                'descripcion':  d.descripcion,
            }
            for d in sorted(a.documentos, key=lambda x: x.orden)
        ],
        'hallazgos': [
            h.descripcion
            for h in sorted(a.hallazgos, key=lambda x: x.orden)
        ],
    }


@documentos_router.route('/documentos/<int:id_proyecto>', methods=['GET'])
def listar_analisis(id_proyecto):
    try:
        with Session(engine) as session:
            analisis = session.scalars(
                select(AnalisisDocumento)
                .where(AnalisisDocumento.id_proyecto == id_proyecto)
                .order_by(AnalisisDocumento.fecha_creacion.desc())
            ).all()
            return jsonify([serializar_analisis(a, session) for a in analisis]), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500


@documentos_router.route('/documentos/detalle/<int:id_analisis>', methods=['GET'])
def obtener_analisis(id_analisis):
    try:
        with Session(engine) as session:
            a = session.get(AnalisisDocumento, id_analisis)
            if not a:
                return jsonify({'error': 'Análisis no encontrado'}), 404
            return jsonify(serializar_analisis(a, session)), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500


@documentos_router.route('/documentos/crear', methods=['POST'])
def crear_analisis():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON inválido o vacío'}), 400

        campos_obligatorios = ['id_proyecto', 'titulo', 'tipo_documento', 'fuente']
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({'error': f"Faltan campos: {', '.join(faltantes)}"}), 400

        with Session(engine) as session:
            analisis = AnalisisDocumento(
                id_proyecto     = data['id_proyecto'],
                titulo          = data['titulo'],
                tipo_documento  = data['tipo_documento'],
                fuente          = data['fuente'],
                id_proceso      = data.get('id_proceso') or None,
                id_subproceso   = data.get('id_subproceso') or None,
                recomendaciones = data.get('recomendaciones', ''),
                fecha_creacion  = datetime.now(),
            )
            session.add(analisis)
            session.flush()

            for i, doc in enumerate(data.get('documentos', []), start=1):
                if doc.get('nombre', '').strip():
                    session.add(DocumentoAnalizado(
                        id_analisis = analisis.id_analisis,
                        nombre      = doc['nombre'],
                        tipo        = doc.get('tipo', ''),
                        url         = doc.get('url', ''),
                        descripcion = doc.get('descripcion', ''),
                        orden       = i,
                    ))

            for i, h in enumerate(data.get('hallazgos', []), start=1):
                if h.strip():
                    session.add(HallazgoAnalisis(
                        id_analisis = analisis.id_analisis,
                        descripcion = h,
                        orden       = i,
                    ))

            session.commit()
            session.refresh(analisis)
            return jsonify({
                'mensaje':  'Análisis creado exitosamente',
                'analisis': serializar_analisis(analisis, session)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500


# PATCH /documentos/actualizar/<id_analisis> 
@documentos_router.route('/documentos/actualizar/<int:id_analisis>', methods=['PATCH'])
def actualizar_analisis(id_analisis):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON inválido o vacío'}), 400

        with Session(engine) as session:
            analisis = session.get(AnalisisDocumento, id_analisis)
            if not analisis:
                return jsonify({'error': 'Análisis no encontrado'}), 404

            # Actualizar campos principales
            for campo in ['titulo', 'tipo_documento', 'fuente', 'recomendaciones']:
                if campo in data:
                    setattr(analisis, campo, data[campo])

            if 'id_proceso' in data:
                analisis.id_proceso = data['id_proceso'] or None
            if 'id_subproceso' in data:
                analisis.id_subproceso = data['id_subproceso'] or None

            # Reemplazar documentos: borrar los anteriores e insertar los nuevos
            if 'documentos' in data:
                for d in session.scalars(
                    select(DocumentoAnalizado).where(DocumentoAnalizado.id_analisis == id_analisis)
                ).all():
                    session.delete(d)
                session.flush()

                for i, doc in enumerate(data['documentos'], start=1):
                    if doc.get('nombre', '').strip():
                        session.add(DocumentoAnalizado(
                            id_analisis = id_analisis,
                            nombre      = doc['nombre'],
                            tipo        = doc.get('tipo', ''),
                            url         = doc.get('url', ''),
                            descripcion = doc.get('descripcion', ''),
                            orden       = i,
                        ))

            # Reemplazar hallazgos: borrar los anteriores e insertar los nuevos
            if 'hallazgos' in data:
                for h in session.scalars(
                    select(HallazgoAnalisis).where(HallazgoAnalisis.id_analisis == id_analisis)
                ).all():
                    session.delete(h)
                session.flush()

                for i, h in enumerate(data['hallazgos'], start=1):
                    if h.strip():
                        session.add(HallazgoAnalisis(
                            id_analisis = id_analisis,
                            descripcion = h,
                            orden       = i,
                        ))

            session.commit()
            session.refresh(analisis)
            return jsonify({
                'mensaje':  'Análisis actualizado correctamente',
                'analisis': serializar_analisis(analisis, session)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500


@documentos_router.route('/documentos/eliminar/<int:id_analisis>', methods=['DELETE'])
def eliminar_analisis(id_analisis):
    try:
        with Session(engine) as session:
            a = session.get(AnalisisDocumento, id_analisis)
            if not a:
                return jsonify({'error': 'Análisis no encontrado'}), 404
            session.delete(a)
            session.commit()
            return jsonify({'mensaje': 'Análisis eliminado correctamente'}), 200
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500