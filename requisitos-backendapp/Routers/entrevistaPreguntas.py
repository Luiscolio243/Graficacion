from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from db import engine
from Models.EntrevistasPreguntas import EntrevistaPreguntas
from Models.Entrevistas import Entrevistas
from sqlalchemy.exc import SQLAlchemyError

entrevista_preguntas_bp = Blueprint('entrevista_preguntas', __name__)


def serializar_pregunta(p: EntrevistaPreguntas) -> dict:
    return {
        "id_ent_prg": p.id_ent_prg,
        "id_entrevista": p.id_entrevista,
        "pregunta": p.pregunta,
        "respuesta": p.respuesta,
        "orden": p.orden,
        "origen": p.origen,
        "timestamp_audio": p.timestamp_audio,
    }


#Con este endpoint se retornan de las preguntas de una entrevista en especifico de una manera ordenada
@entrevista_preguntas_bp.route('/preguntas/<int:id_entrevista>', methods=['GET'])
def obtener_preguntas(id_entrevista):
    try:
        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            preguntas = session.scalars(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == id_entrevista)
                .order_by(EntrevistaPreguntas.orden)
            ).all()

            return jsonify([serializar_pregunta(p) for p in preguntas]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Agregamos preguntas a una entrevista que ya existe en especifico
@entrevista_preguntas_bp.route('/preguntas/agregar', methods=['POST'])
def agregar_pregunta():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_obligatorios = ["id_entrevista", "pregunta"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({
                "error": f"Faltan campos obligatorios: {', '.join(faltantes)}"
            }), 400

        with Session(engine) as session:
            entrevista = session.get(Entrevistas, data["id_entrevista"])
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            # Calcular el siguiente orden automáticamente
            total_preguntas = session.scalar(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == data["id_entrevista"])
                .with_only_columns(EntrevistaPreguntas.id_ent_prg)
                .correlate(False)
            )
            siguiente_orden = (len(session.scalars(
                select(EntrevistaPreguntas)
                .where(EntrevistaPreguntas.id_entrevista == data["id_entrevista"])
            ).all())) + 1

            pregunta = EntrevistaPreguntas(
                id_entrevista=data["id_entrevista"],
                pregunta=data["pregunta"],
                respuesta=data.get("respuesta"),
                orden=data.get("orden", siguiente_orden),
                origen=data.get("origen", "manual"),
                timestamp_audio=data.get("timestamp_audio"),
            )
            session.add(pregunta)
            session.commit()
            session.refresh(pregunta)

            return jsonify({
                "mensaje": "Pregunta agregada exitosamente",
                "pregunta": serializar_pregunta(pregunta)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Se actualizan campos como el texto de una pregunta o la respuesta de la misma
@entrevista_preguntas_bp.route('/preguntas/actualizar/<int:id_ent_prg>', methods=['PATCH'])
def actualizar_pregunta(id_ent_prg):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_editables = ["pregunta", "respuesta", "orden", "origen", "timestamp_audio"]

        with Session(engine) as session:
            pregunta = session.get(EntrevistaPreguntas, id_ent_prg)
            if not pregunta:
                return jsonify({"error": "Pregunta no encontrada"}), 404

            for campo in campos_editables:
                if campo in data:
                    setattr(pregunta, campo, data[campo])

            session.commit()
            session.refresh(pregunta)
            return jsonify({
                "mensaje": "Pregunta actualizada",
                "pregunta": serializar_pregunta(pregunta)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Se elimina de una pregunta de la entrevista
@entrevista_preguntas_bp.route('/preguntas/eliminar/<int:id_ent_prg>', methods=['DELETE'])
def eliminar_pregunta(id_ent_prg):
    try:
        with Session(engine) as session:
            pregunta = session.get(EntrevistaPreguntas, id_ent_prg)
            if not pregunta:
                return jsonify({"error": "Pregunta no encontrada"}), 404

            session.delete(pregunta)
            session.commit()
            return jsonify({"mensaje": "Pregunta eliminada correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500