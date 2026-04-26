from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from db import engine
from Models.Encuestas import Encuestas
from Models.EncuestaPreguntas import EncuestaPreguntas
from Models.EncuestaRespuestas import EncuestaRespuestas
from Models.Stakeholders import Stakeholders
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

responder_encuesta_bp = Blueprint('responder_encuesta', __name__)

# GET — obtener encuesta con preguntas para que el stakeholder la responda
@responder_encuesta_bp.route('/responder/encuesta/<int:id_encuesta>/stakeholder/<int:id_stakeholder>', methods=['GET'])
def obtener_encuesta_publica(id_encuesta, id_stakeholder):
    try:
        with Session(engine) as session:
            encuesta = session.get(Encuestas, id_encuesta)
            if not encuesta:
                return jsonify({"error": "Encuesta no encontrada"}), 404

            stakeholder = session.get(Stakeholders, id_stakeholder)
            if not stakeholder:
                return jsonify({"error": "Stakeholder no encontrado"}), 404

            preguntas = session.scalars(
                select(EncuestaPreguntas)
                .where(EncuestaPreguntas.id_encuesta == id_encuesta)
                .order_by(EncuestaPreguntas.orden)
            ).all()

            preguntas_data = []
            for p in preguntas:
                opciones = [op.opcion for op in p.opciones] if p.opciones else []
                preguntas_data.append({
                    "id_pregunta": p.id_pregunta,
                    "pregunta": p.pregunta,
                    "tipo": p.tipo,
                    "orden": p.orden,
                    "opciones": opciones,
                })

            return jsonify({
                "id_encuesta": encuesta.id_encuesta,
                "titulo": encuesta.titulo,
                "descripcion": encuesta.descripcion,
                "stakeholder": stakeholder.nombre,
                "preguntas": preguntas_data,
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# POST — guardar respuestas del stakeholder
@responder_encuesta_bp.route('/responder/encuesta/<int:id_encuesta>/stakeholder/<int:id_stakeholder>', methods=['POST'])
def guardar_respuestas_publicas(id_encuesta, id_stakeholder):
    try:
        data = request.get_json()
        if not data or not data.get("respuestas"):
            return jsonify({"error": "No se enviaron respuestas"}), 400

        with Session(engine) as session:
            encuesta = session.get(Encuestas, id_encuesta)
            if not encuesta:
                return jsonify({"error": "Encuesta no encontrada"}), 404

            for item in data["respuestas"]:
                respuesta = EncuestaRespuestas(
                    id_encuesta=id_encuesta,
                    id_pregunta=item["id_pregunta"],
                    id_stakeholder=id_stakeholder,
                    respuesta=item["respuesta"],
                    fecha_respuesta=datetime.now(),
                )
                session.add(respuesta)

            session.commit()
            return jsonify({"mensaje": "Respuestas guardadas correctamente"}), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500