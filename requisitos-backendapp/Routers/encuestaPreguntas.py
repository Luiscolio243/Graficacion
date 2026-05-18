from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from datetime import datetime
from Models.EncuestaPreguntas import EncuestaPreguntas
from Models.EncuestaOpciones import EncuestaOpciones
from Models.EncuestaRespuestas import EncuestaRespuestas
from Models.Encuestas import Encuestas
from Models.Stakeholders import Stakeholders

encuesta_preguntas_bp = Blueprint('encuesta_preguntas', __name__)

TIPO_MAP = {
    "abierta":        "abierta",
    "opcionMultiple": "opcion_multiple",
    "opcion_multiple":"opcion_multiple",
    "escala":         "escala",
    "siNo":           "si_no",
    "si_no":          "si_no",
}


# Carga la encuesta con sus preguntas para que el stakeholder la responda
@encuesta_preguntas_bp.route('/responder/encuesta/<int:id_encuesta>/stakeholder/<int:id_stakeholder>', methods=['GET'])
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
                    "pregunta":    p.pregunta,
                    "tipo":        p.tipo,
                    "orden":       p.orden,
                    "opciones":    opciones,
                })
 
            return jsonify({
                "id_encuesta": encuesta.id_encuesta,
                "titulo":      encuesta.titulo,
                "descripcion": encuesta.descripcion,
                "stakeholder": stakeholder.nombre,
                "preguntas":   preguntas_data,
            }), 200
 
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
 
 
# Guarda las respuestas del stakeholder
@encuesta_preguntas_bp.route('/responder/encuesta/<int:id_encuesta>/stakeholder/<int:id_stakeholder>', methods=['POST'])
def guardar_respuestas(id_encuesta, id_stakeholder):
    try:
        data = request.get_json()
        if not data or "respuestas" not in data:
            return jsonify({"error": "Se requiere el campo 'respuestas'"}), 400
 
        with Session(engine) as session:
            encuesta = session.get(Encuestas, id_encuesta)
            if not encuesta:
                return jsonify({"error": "Encuesta no encontrada"}), 404
 
            for item in data["respuestas"]:
                id_pregunta = item.get("id_pregunta")
                respuesta   = item.get("respuesta", "").strip()
                if not id_pregunta or not respuesta:
                    continue
 
                session.add(EncuestaRespuestas(
                    id_encuesta=id_encuesta,
                    id_pregunta=id_pregunta,
                    id_stakeholder=id_stakeholder,
                    respuesta=respuesta,
                    fecha_respuesta=datetime.now(),
                ))
 
            session.commit()
            return jsonify({"message": "Respuestas guardadas correctamente"}), 201
 
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
 
 
@encuesta_preguntas_bp.route('/encuestas/preguntas/agregar', methods=['POST'])
def agregar_pregunta():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400
 
        id_encuesta = data.get("id_encuesta")
        texto       = data.get("pregunta", "").strip()
        if not id_encuesta or not texto:
            return jsonify({"error": "id_encuesta y pregunta son obligatorios"}), 400
 
        with Session(engine) as session:
            encuesta = session.get(Encuestas, id_encuesta)
            if not encuesta:
                return jsonify({"error": "Encuesta no encontrada"}), 404
 
            total = len(session.scalars(
                select(EncuestaPreguntas).where(EncuestaPreguntas.id_encuesta == id_encuesta)
            ).all())
 
            tipo_normalizado = TIPO_MAP.get(data.get("tipo", "abierta"), "abierta")
 
            pregunta = EncuestaPreguntas(
                id_encuesta=id_encuesta,
                pregunta=texto,
                tipo=tipo_normalizado,
                orden=total + 1,
            )
            session.add(pregunta)
            session.flush()
 
            if tipo_normalizado == "opcion_multiple":
                for j, op in enumerate(
                    [o for o in data.get("opciones", []) if o and o.strip()], start=1
                ):
                    session.add(EncuestaOpciones(
                        id_pregunta=pregunta.id_pregunta,
                        opcion=op.strip(),
                        orden=j,
                    ))
 
            session.commit()
            session.refresh(pregunta)
            return jsonify({
                "message": "Pregunta agregada",
                "pregunta": {
                    "id_pregunta": pregunta.id_pregunta,
                    "pregunta":    pregunta.pregunta,
                    "tipo":        pregunta.tipo,
                    "orden":       pregunta.orden,
                }
            }), 201
 
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
 
 
@encuesta_preguntas_bp.route('/encuestas/preguntas/eliminar/<int:id_pregunta>', methods=['DELETE'])
def eliminar_pregunta(id_pregunta):
    try:
        with Session(engine) as session:
            pregunta = session.get(EncuestaPreguntas, id_pregunta)
            if not pregunta:
                return jsonify({"error": "Pregunta no encontrada"}), 404
 
            session.delete(pregunta)
            session.commit()
            return jsonify({"message": "Pregunta eliminada"}), 200
 
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500