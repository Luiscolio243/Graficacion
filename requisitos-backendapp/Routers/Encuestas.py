from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from Models.Encuestas import Encuestas
from db import engine
from datetime import datetime
from Models.EncuestaOpciones import EncuestaOpciones
from sqlalchemy.exc import SQLAlchemyError
from Models.EncuestaPreguntas import EncuestaPreguntas
from Models.Proyectos import Proyecto
from Models.EncuestaRespuestas import EncuestaRespuestas

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
                id_subproceso=int(data["id_subproceso"]) if data.get("id_subproceso") else None,
                titulo=data["titulo"],
                descripcion=data.get("descripcion"),
                num_participantes=data.get("num_participantes", 0),
                estado="borrador",
                fecha_creacion=datetime.now(),
            )

            session.add(encuesta)
            #El flush lo utilizamos para que el mapeador convierta a instruccion sql mi objeto creado de encuesta, pero no lo guardara a la bd aun
            session.flush()

            TIPO_MAP = {
                "abierta": "abierta",
                "opcionMultiple": "opcion_multiple",
                "opcion_multiple": "opcion_multiple",
                "escala": "escala",
                "siNo": "si_no",
                "si_no": "si_no",
            }

            for i, preg_data in enumerate(data.get("preguntas", []), start=1):
                tipo_normalizado = TIPO_MAP.get(preg_data.get("tipo", "abierta"), "abierta")
                pregunta = EncuestaPreguntas(
                    id_encuesta=encuesta.id_encuesta,
                    pregunta=preg_data["pregunta"],
                    tipo=tipo_normalizado,
                    orden=preg_data.get("orden", i),
                )
                session.add(pregunta)
                session.flush()

                # Si es opcion_multiple agregar las opciones
                if tipo_normalizado == "opcion_multiple":
                    opciones = [op for op in preg_data.get("opciones", []) if op and op.strip()]
                    for j, op in enumerate(opciones, start=1):
                        opcion = EncuestaOpciones(
                            id_pregunta=pregunta.id_pregunta,
                            opcion=op.strip(),
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
        print("ERROR DETALLADO:", str(e))
        return jsonify({"error": str(e)}), 500



@encuestas_bp.route('/encuestas/obtener/<int:id_proyecto>', methods=['GET'])
def obtener_todas_encuestas(id_proyecto):
    try:
        with Session(engine) as session:
            stmt = (
                select(Encuestas)
                .join(Proyecto, Encuestas.id_proyecto == Proyecto.id_proyecto)
                .where(Proyecto.id_proyecto == id_proyecto)
            )

            encuestas = session.scalars(stmt).all()

            for e in encuestas:
                print(vars(e))

            return jsonify([
                {
                    "id_encuesta": e.id_encuesta,
                    "id_proyecto": e.id_proyecto,
                    "titulo": e.titulo,
                    "descripcion": e.descripcion,
                    "estado": e.estado,
                    "num_participantes": e.num_participantes
                }
                for e in encuestas
            ]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@encuestas_bp.route('/encuestas/<int:id_encuesta>', methods=['GET'])
def obtener_encuesta(id_encuesta):
    try:
        with Session(engine) as session:
            stmt = select(Encuestas).where(Encuestas.id_encuesta == id_encuesta)
            encuesta = session.scalar(stmt)

            if not encuesta:
                return jsonify({"error": "No encontrado", "message": "La encuesta no existe"}), 404

            # Serializar preguntas con opciones
            preguntas_data = []
            for pregunta in encuesta.preguntas:
                opciones = [op.opcion for op in pregunta.opciones] if pregunta.opciones else []
                preguntas_data.append({
                    "id_pregunta": pregunta.id_pregunta,
                    "pregunta": pregunta.pregunta,
                    "tipo": pregunta.tipo,
                    "orden": pregunta.orden,
                    "opciones": opciones
                })

            encuesta_dict = {
                "id_encuesta": encuesta.id_encuesta,
                "id_proyecto": encuesta.id_proyecto,
                "id_subproceso": encuesta.id_subproceso,
                "titulo": encuesta.titulo,
                "descripcion": encuesta.descripcion,
                "num_participantes": encuesta.num_participantes,
                "estado": encuesta.estado,
                "fecha_creacion": encuesta.fecha_creacion.isoformat() if encuesta.fecha_creacion else None,
                "preguntas": preguntas_data
            }

            return jsonify(encuesta_dict), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@encuestas_bp.route('/respuestas/obtener/<int:id_encuesta>', methods=['GET'])
def obtener_respuestas_encuesta(id_encuesta):
    try:
        with Session(engine) as session:
            stmt = select(EncuestaRespuestas).where(EncuestaRespuestas.id_encuesta == id_encuesta)
            respuestas = session.scalars(stmt).all()

            respuestas_data = [
                {
                    "id_respuesta": r.id_respuesta,
                    "id_encuesta": r.id_encuesta,
                    "id_pregunta": r.id_pregunta,
                    "id_stakeholder": r.id_stakeholder,
                    "respuesta": r.respuesta,
                    "fecha_respuesta": r.fecha_respuesta.isoformat() if r.fecha_respuesta else None
                }
                for r in respuestas
            ]

            return jsonify(respuestas_data), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500