from flask import Blueprint, request, jsonify
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime, date
from db import engine
from Models.Observaciones import Observaciones
from sqlalchemy.exc import SQLAlchemyError

observaciones_bp = Blueprint('observaciones', __name__)


def parsear_fecha(fecha_str: str | None) -> date | None:
    """Convierte 'YYYY-MM-DD' a objeto date. Retorna None si es inválido."""
    if not fecha_str:
        return None
    try:
        return datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return None


def serializar_observacion(o: Observaciones) -> dict:
    return {
        "id_observacion": o.id_observacion,
        "id_proyecto": o.id_proyecto,
        "id_subproceso": o.id_subproceso,
        "id_observador": o.id_observador,
        "fecha_observacion": o.fecha_observacion.isoformat() if o.fecha_observacion else None,
        "lugar": o.lugar,
        "duracion_minutos": o.duracion_minutos,
        "descripcion": o.descripcion,
        "problema_detectado": o.problema_detectado,
        "contexto": o.contexto,
        "fecha_creacion": o.fecha_creacion.isoformat() if o.fecha_creacion else None,
    }


@observaciones_bp.route('/observaciones/<int:id_proyecto>', methods=['GET'])
def obtener_observaciones(id_proyecto):
    try:
        with Session(engine) as session:
            observaciones = session.scalars(
                select(Observaciones)
                .where(Observaciones.id_proyecto == id_proyecto)
                .order_by(Observaciones.fecha_creacion.desc())
            ).all()

            return jsonify([serializar_observacion(o) for o in observaciones]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@observaciones_bp.route('/observaciones/detalle/<int:id_observacion>', methods=['GET'])
def obtener_observacion(id_observacion):
    try:
        with Session(engine) as session:
            observacion = session.get(Observaciones, id_observacion)

            if not observacion:
                return jsonify({"error": "Observación no encontrada"}), 404

            return jsonify(serializar_observacion(observacion)), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@observaciones_bp.route('/observaciones/crear', methods=['POST'])
def crear_observacion():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_obligatorios = ["id_proyecto", "id_observador", "lugar", "descripcion"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({
                "error": f"Faltan campos obligatorios: {', '.join(faltantes)}"
            }), 400

        with Session(engine) as session:
            observacion = Observaciones(
                id_proyecto=data["id_proyecto"],
                id_observador=data["id_observador"],
                lugar=data["lugar"],
                descripcion=data["descripcion"],
                id_subproceso=data.get("id_subproceso"),
                fecha_observacion=parsear_fecha(data.get("fecha_observacion")),
                duracion_minutos=data.get("duracion_minutos"),
                problema_detectado=data.get("problema_detectado"),
                contexto=data.get("contexto"),
                fecha_creacion=datetime.now(),
            )
            session.add(observacion)
            session.commit()
            session.refresh(observacion)

            return jsonify({
                "mensaje": "Observación creada exitosamente",
                "observacion": serializar_observacion(observacion)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@observaciones_bp.route('/observaciones/actualizar/<int:id_observacion>', methods=['PATCH'])
def actualizar_observacion(id_observacion):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_editables = [
            "lugar", "descripcion", "problema_detectado",
            "contexto", "duracion_minutos", "fecha_observacion",
            "id_subproceso", "id_observador"
        ]

        with Session(engine) as session:
            observacion = session.get(Observaciones, id_observacion)
            if not observacion:
                return jsonify({"error": "Observación no encontrada"}), 404

            for campo in campos_editables:
                if campo in data:
                    if campo == "fecha_observacion":
                        setattr(observacion, campo, parsear_fecha(data[campo]))
                    else:
                        setattr(observacion, campo, data[campo])

            session.commit()
            session.refresh(observacion)

            return jsonify({
                "mensaje": "Observación actualizada correctamente",
                "observacion": serializar_observacion(observacion)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@observaciones_bp.route('/observaciones/eliminar/<int:id_observacion>', methods=['DELETE'])
def eliminar_observacion(id_observacion):
    try:
        with Session(engine) as session:
            observacion = session.get(Observaciones, id_observacion)
            if not observacion:
                return jsonify({"error": "Observación no encontrada"}), 404

            session.delete(observacion)
            session.commit()

            return jsonify({"mensaje": "Observación eliminada correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500