from flask import Blueprint, request, jsonify
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from datetime import datetime, date
from db import engine
from Models.Entrevistas import Entrevistas
from Models.EntrevistasPreguntas import EntrevistaPreguntas
from sqlalchemy.exc import SQLAlchemyError

entrevistas_bp = Blueprint('entrevistas', __name__)

#Esta funcion es para convertir el formato de fecha en sql a un objeto que sea de tipo date
def parsear_fecha(fecha_str: str | None) -> date | None:
    if not fecha_str:
        return None
    try:
        return datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return None

#Es para convertir una entrevista en un json, que al ser un objeto muy grande lo separe en una funcion para mayor orden
def serializar_entrevista(e: Entrevistas, total_preguntas: int = 0) -> dict:
    return {
        "id_entrevista": e.id_entrevista,
        "titulo": e.titulo,
        "id_proyecto": e.id_proyecto,
        "id_subproceso": e.id_subproceso,
        "id_stakeholder": e.id_stakeholder,
        "id_entrevistador": e.id_entrevistador,
        "fecha_programada": e.fecha_programada.isoformat() if e.fecha_programada else None,
        "fecha_realizada": e.fecha_realizada.isoformat() if e.fecha_realizada else None,
        "fecha_creacion": e.fecha_creacion.isoformat() if e.fecha_creacion else None,
        "lugar": e.lugar,
        "objetivo": e.objetivo,
        "estado": e.estado,
        "audio_url": e.audio_url,
        "procesado_ia": e.procesado_ia,
        "total_preguntas": total_preguntas,
    }


#Retorna absolutamente de todas las entrevistas que hay en tal proyecto ademas de devolver un conteto de preguntas
@entrevistas_bp.route('/entrevistas/<int:id_proyecto>', methods=['GET'])
def obtener_entrevistas(id_proyecto):
    try:
        with Session(engine) as session:
            entrevistas = session.scalars(
                select(Entrevistas).where(Entrevistas.id_proyecto == id_proyecto)
            ).all()

            resultado = []
            for e in entrevistas:
                total = session.scalar(
                    select(func.count()).where(
                        EntrevistaPreguntas.id_entrevista == e.id_entrevista
                    )
                )
                resultado.append(serializar_entrevista(e, total_preguntas=total))

            return jsonify(resultado), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Crea de una entrevista en un cierto proyecto que se envia el id como parametro
@entrevistas_bp.route('/entrevistas/crear', methods=['POST'])
def crear_entrevista():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_obligatorios = ["id_proyecto", "id_stakeholder", "id_entrevistador", "titulo"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({
                "error": f"Faltan campos obligatorios: {', '.join(faltantes)}"
            }), 400

        with Session(engine) as session:
            entrevista = Entrevistas(
                id_proyecto=data["id_proyecto"],
                id_stakeholder=data["id_stakeholder"],
                id_entrevistador=data["id_entrevistador"],
                titulo=data["titulo"],
                id_subproceso=data.get("id_subproceso"),        # opcional
                fecha_programada=parsear_fecha(data.get("fecha_programada")),
                lugar=data.get("lugar"),
                objetivo=data.get("objetivo"),
                estado="planificada",
                procesado_ia=False,
                fecha_creacion=datetime.now(),
            )
            session.add(entrevista)
            session.commit()
            session.refresh(entrevista)

            return jsonify({
                "mensaje": "Entrevista creada exitosamente",
                "entrevista": serializar_entrevista(entrevista)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Obtiene de los detalles de las entrevistas asi como las preguntas de esa entrevista
@entrevistas_bp.route('/entrevistas/detalle/<int:id_entrevista>', methods=['GET'])
def obtener_entrevista(id_entrevista):
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

            data = serializar_entrevista(entrevista, total_preguntas=len(preguntas))
            data["preguntas"] = [
                {
                    "id_ent_prg": p.id_ent_prg,
                    "pregunta": p.pregunta,
                    "respuesta": p.respuesta,
                    "orden": p.orden,
                    "origen": p.origen,
                    "timestamp_audio": p.timestamp_audio,
                }
                for p in preguntas
            ]
            return jsonify(data), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Actualizar una entrevista con los campos que se mandan con este endpoint
@entrevistas_bp.route('/entrevistas/actualizar/<int:id_entrevista>', methods=['PATCH'])
def actualizar_entrevista(id_entrevista):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        campos_editables = [
            "titulo", "lugar", "objetivo", "estado",
            "audio_url", "procesado_ia", "fecha_programada", "fecha_realizada"
        ]

        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            for campo in campos_editables:
                if campo in data:
                    if campo in ("fecha_programada", "fecha_realizada"):
                        setattr(entrevista, campo, parsear_fecha(data[campo]))
                    else:
                        setattr(entrevista, campo, data[campo])

            session.commit()
            session.refresh(entrevista)
            return jsonify({
                "mensaje": "Entrevista actualizada",
                "entrevista": serializar_entrevista(entrevista)
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#Se eleimina de la entrevista y tambien de las preguntas que se le crearon a esa entrevista
@entrevistas_bp.route('/entrevistas/eliminar/<int:id_entrevista>', methods=['DELETE'])
def eliminar_entrevista(id_entrevista):
    try:
        with Session(engine) as session:
            entrevista = session.get(Entrevistas, id_entrevista)
            if not entrevista:
                return jsonify({"error": "Entrevista no encontrada"}), 404

            session.delete(entrevista)
            session.commit()
            return jsonify({"mensaje": "Entrevista eliminada correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500