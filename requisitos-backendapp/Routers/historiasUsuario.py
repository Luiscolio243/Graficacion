from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from db import engine
from Models.HistoriaUsuario import HistoriaUsuario

historias_bp = Blueprint('historias', __name__)

def serializar_historia(h: HistoriaUsuario) -> dict:
    return {
        "id_historia": h.id_historia,
        "id_proyecto": h.id_proyecto,
        "id_subproceso": h.id_subproceso,
        "titulo": h.titulo,
        "rol": h.rol,
        "accion": h.accion,
        "beneficio": h.beneficio,
        "prioridad": h.prioridad,
        "estimacion": h.estimacion,
        "criterios": h.criterios or [],
        "fecha_creacion": h.fecha_creacion.isoformat() if h.fecha_creacion else None,
    }

# Obtener todas las historias de un proyecto
@historias_bp.route('/historias-usuario/<int:id_proyecto>', methods=['GET'])
def obtener_historias(id_proyecto):
    try:
        with Session(engine) as session:
            historias = session.scalars(
                select(HistoriaUsuario)
                .where(HistoriaUsuario.id_proyecto == id_proyecto)
                .order_by(HistoriaUsuario.fecha_creacion.desc())
            ).all()
            return jsonify([serializar_historia(h) for h in historias]), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# Crear historia
@historias_bp.route('/historias-usuario/crear', methods=['POST'])
def crear_historia():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_obligatorios = ["id_proyecto", "titulo", "rol", "accion", "beneficio", "prioridad"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({"error": f"Faltan campos: {', '.join(faltantes)}"}), 400

        # Filtrar criterios vacíos
        criterios = [c for c in data.get("criterios", []) if c and c.strip()]

        with Session(engine) as session:
            historia = HistoriaUsuario(
                id_proyecto=data["id_proyecto"],
                id_subproceso=int(data["id_subproceso"]) if data.get("id_subproceso") else None,
                titulo=data["titulo"],
                rol=data["rol"],
                accion=data["accion"],
                beneficio=data["beneficio"],
                prioridad=data["prioridad"],
                estimacion=data.get("estimacion") or None,
                criterios=criterios,
                fecha_creacion=datetime.now(),
            )
            session.add(historia)
            session.commit()
            session.refresh(historia)
            return jsonify({
                "mensaje": "Historia creada exitosamente",
                "historia": serializar_historia(historia)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# Eliminar historia
@historias_bp.route('/historias-usuario/eliminar/<int:id_historia>', methods=['DELETE'])
def eliminar_historia(id_historia):
    try:
        with Session(engine) as session:
            historia = session.get(HistoriaUsuario, id_historia)
            if not historia:
                return jsonify({"error": "Historia no encontrada"}), 404
            session.delete(historia)
            session.commit()
            return jsonify({"mensaje": "Historia eliminada correctamente"}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500