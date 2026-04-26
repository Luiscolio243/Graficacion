from flask import Blueprint, jsonify, request
from db import engine
from sqlalchemy.orm import Session
from sqlalchemy import select
from Models.Seguimiento import Seguimiento
from Models.SeguimientoPaso import SeguimientoPaso
from Models.SeguimientoProblema import SeguimientoProblema
from Models.SeguimientoMetrica import SeguimientoMetrica
from datetime import datetime


seguimiento_bp = Blueprint('seguimiento', __name__)

def serializar_seguimiento_lista(s):
    # Para la pantalla de lista (solo datos principales)
    return {
        "id_seguimiento":   s.id_seguimiento,
        "titulo":         s.titulo,
        "id_transaccion": s.id_transaccion,
        "nombre_proceso": s.nombre_proceso,
        "id_responsable":   s.id_responsable,
        "fecha_creacion": str(s.fecha_creacion) if s.fecha_creacion else None,
    }


def serializar_paso(p):
    return {
        "id_seguimiento_paso": p.id_seguimiento_paso,
        "nombre":              p.nombre,
        "duracion_min":        p.duracion_min,
        "orden":               p.orden,
    }


def serializar_problema(p):
    return {
        "id_seguimiento_problema": p.id_seguimiento_problema,
        "descripcion":             p.descripcion,
    }


def serializar_metrica(m):
    return {
        "id_seguimiento_metrica": m.id_seguimiento_metrica,
        "nombre":                 m.nombre,
        "valor":                  m.valor,
    }

def serializar_seguimiento_detalle(s):
    return {
        "id_seguimiento":   s.id_seguimiento,
        "titulo":           s.titulo,
        "id_transaccion":   s.id_transaccion,
        "nombre_proceso":   s.nombre_proceso,
        "id_proceso":       s.id_proceso,
        "id_subproceso":    s.id_subproceso,
        "id_responsable":   s.id_responsable,
        "fecha_creacion":   s.fecha_creacion.isoformat() if s.fecha_creacion else None,
        "pasos":            [serializar_paso(p)     for p in s.pasos],
        "problemas":        [serializar_problema(p) for p in s.problemas],
        "metricas":         [serializar_metrica(m)  for m in s.metricas],
    }



def obtener_seguimientos(id_proyecto):
    try:
        with Session(engine) as session:
            seguimientos = session.query(Seguimiento).filter(
                Seguimiento.id_proyecto == id_proyecto
            ).all()

            return jsonify([serializar_seguimiento_lista(s) for s in seguimientos]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@seguimiento_bp.route('/seguimientos/obtener/<int:id_proyecto>', methods=['GET'])
def obtener_seguimientos(id_proyecto):
    try:
        with Session(engine) as session:
            seguimientos = session.scalars(
                select(Seguimiento)
                .where(Seguimiento.id_proyecto == id_proyecto)
                .order_by(Seguimiento.fecha_creacion.desc())
            ).all()
            return jsonify([serializar_seguimiento_lista(s) for s in seguimientos]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@seguimiento_bp.route('/seguimientos/detalle/<int:id_seguimiento>', methods=['GET'])
def obtener_seguimiento(id_seguimiento):
    try:
        with Session(engine) as session:
            s = session.get(Seguimiento, id_seguimiento)
            if not s:
                return jsonify({"error": "Seguimiento no encontrado"}), 404
            return jsonify(serializar_seguimiento_detalle(s)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@seguimiento_bp.route('/seguimientos/crear/<int:id_proyecto>', methods=['POST'])
def crear_seguimiento(id_proyecto):
    try:
        data = request.get_json()

        with Session(engine) as session:
            nuevo = Seguimiento(
                id_proyecto    = id_proyecto,
                titulo         = data.get('titulo'),
                nombre_proceso = data.get('nombre_proceso', ''),
                id_proceso     = data.get('id_proceso'),
                id_subproceso  = data.get('id_subproceso'),
                id_responsable = data.get('id_responsable'),
                id_transaccion = f"TXN-{datetime.now().year}-TEMP-{datetime.now().microsecond}",
                fecha_creacion = datetime.now(),
            )
            session.add(nuevo)
            session.flush()  # obtener id_seguimiento

            # Generar ID de transacción automático
            anio = datetime.now().year
            nuevo.id_transaccion = f"TXN-{anio}-{str(nuevo.id_seguimiento).zfill(3)}"

            for i, paso in enumerate(data.get('pasos', []), start=1):
                if paso.get('nombre', '').strip():
                    session.add(SeguimientoPaso(
                        id_seguimiento = nuevo.id_seguimiento,
                        nombre         = paso['nombre'],
                        duracion_min   = paso.get('duracion_min'),
                        orden          = i,
                    ))

            for problema in data.get('problemas', []):
                if problema.get('descripcion', '').strip():
                    session.add(SeguimientoProblema(
                        id_seguimiento = nuevo.id_seguimiento,
                        descripcion    = problema['descripcion'],
                    ))

            for metrica in data.get('metricas', []):
                if metrica.get('nombre', '').strip():
                    session.add(SeguimientoMetrica(
                        id_seguimiento = nuevo.id_seguimiento,
                        nombre         = metrica['nombre'],
                        valor          = metrica.get('valor'),
                    ))

            session.commit()
            session.refresh(nuevo)
            return jsonify(serializar_seguimiento_lista(nuevo)), 201

    except Exception as e:
        print("ERROR DETALLADO:", str(e))
        return jsonify({"error": str(e)}), 500

@seguimiento_bp.route('/seguimientos/eliminar/<int:id_seguimiento>', methods=['DELETE'])
def eliminar_seguimiento(id_seguimiento):
    try:
        with Session(engine) as session:
            s = session.get(Seguimiento, id_seguimiento)
            if not s:
                return jsonify({"error": "Seguimiento no encontrado"}), 404
            session.delete(s)
            session.commit()
            return jsonify({"mensaje": "Seguimiento eliminado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500