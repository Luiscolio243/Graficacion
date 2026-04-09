from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from Models.Encuestas import Encuestas
from app import engine
from datetime import datetime
from Models.EncuestaOpciones import EncuestaOpciones
from sqlalchemy.exc import SQLAlchemyError
from Models.EncuestaPreguntas import EncuestaPreguntas

encuestas_bp = Blueprint('encuestas', __name__)

def serializar_encuesta(e: Encuestas, total_preguntas: int = 0, total_respuestas: int = 0) -> dict:
    return {
        "id_encuesta": e.id_encuesta,
        "id_proyecto": e.id_proyecto,
        "id_subproceso": e.id_subproceso,
        "titulo": e.titulo,
        "descripcion": e.descripcion,
        "num_participantes": e.num_participantes,
        "estado": e.estado,
        "fecha_creacion": e.fecha_creacion,
        "total_preguntas": total_preguntas,
        "total_respuestas": total_respuestas,
    }

@encuestas_bp.route('/encuestas/crear', methods=['POST'])
def crear_encuesta():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "BAD REQUEST", "message": "El JSON enviado es invalido o vacio, favor de revisar la solicitud que se envio" }), 400

        campos_obligatorios = ["id_proyecto", "titulo"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]

        if faltantes:
            return jsonify({"error": "BAD REQUEST" ,"message": "Faltan de datos que son obligatorios para crear una encuesta"}), 400

        with Session(engine) as session:
            encuesta = Encuestas(
                id_proyecto=data["id_proyecto"],
                id_subproceso=data.get("id_subproceso"),
                titulo=data["titulo"],
                descripcion=data.get("descripcion"),
                num_participantes=data.get("num_participantes", 0),
                estado="borrador",
                fecha_creacion=datetime.now(),
            )

            session.add(encuesta)
            #El flush lo utilizamos para que el mapeador convierta a instruccion sql mi objeto creado de encuesta, pero no lo guardara a la bd aun
            session.flush()

            for i, preg_data in enumerate(data.get("preguntas", []), start=1):
                pregunta = EncuestaPreguntas(
                    id_encuesta=encuesta.id_encuesta,
                    pregunta=preg_data["pregunta"],
                    tipo=preg_data.get("tipo", "abierta"),
                    orden=preg_data.get("orden", i),
                )
                session.add(pregunta)
                session.flush()

                # Si es opcion_multiple agregar las opciones
                if pregunta.tipo == "opcion_multiple":
                    for j, op in enumerate(preg_data.get("opciones", []), start=1):
                        opcion = EncuestaOpciones(
                            id_pregunta=pregunta.id_pregunta,
                            opcion=op,
                            orden=j,
                        )
                        session.add(opcion)

            session.commit()
            session.refresh(encuesta)

            return jsonify({
                "message": "Encuesta creada exitosamente",
                "encuesta": serializar_encuesta(encuesta)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
