from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Diagrama import Diagrama
from Models.SeqMensaje import SeqMensaje
from Models.SeqParticipante import SeqParticipante

secuencia_uml_bp = Blueprint('secuencia_uml', __name__)


def serializar_participante(p: SeqParticipante) -> dict:
    return {
        "id": p.id_nodo,
        "nombre": p.nombre,
        "tipo": p.tipo,
        "orden": p.orden,
    }


def serializar_mensaje(m: SeqMensaje) -> dict:
    return {
        "id": m.edge_id,
        "source_id": m.source_id,
        "target_id": m.target_id,
        "contenido": m.contenido,
        "tipo": m.tipo,
        "orden": m.orden,
        "es_self": m.es_self,
    }


@secuencia_uml_bp.route('/diagramas/<int:id_diagrama>/secuencia', methods=['GET'])
def cargar_diagrama_secuencia(id_diagrama):
    try:
        with Session(engine) as session:
            diagrama = session.scalar(select(Diagrama).where(Diagrama.id_diagrama == id_diagrama))

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404
            if diagrama.tipo != 'secuencia':
                return jsonify({"error": "BAD REQUEST", "message": "Este diagrama no es de tipo secuencia"}), 400

            participantes = session.scalars(
                select(SeqParticipante)
                .where(SeqParticipante.id_diagrama == id_diagrama)
                .order_by(SeqParticipante.orden)
            ).all()

            mensajes = session.scalars(
                select(SeqMensaje)
                .where(SeqMensaje.id_diagrama == id_diagrama)
                .order_by(SeqMensaje.orden)
            ).all()

            return jsonify({
                "id_diagrama": diagrama.id_diagrama,
                "nombre": diagrama.nombre,
                "descripcion": diagrama.descripcion,
                "participantes": [serializar_participante(p) for p in participantes],
                "mensajes": [serializar_mensaje(m) for m in mensajes],
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



@secuencia_uml_bp.route('/diagramas/<int:id_diagrama>/secuencia', methods=['PUT'])
def guardar_diagrama_secuencia(id_diagrama):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "BAD REQUEST", "message": "El JSON enviado es inválido o vacío"}), 400

        with Session(engine) as session:
            diagrama = session.scalar(select(Diagrama).where(Diagrama.id_diagrama == id_diagrama))

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404
            if diagrama.tipo != 'secuencia':
                return jsonify({"error": "BAD REQUEST", "message": "Este diagrama no es de tipo secuencia"}), 400


            if "nombre" in data:
                diagrama.nombre = data["nombre"]
            if "descripcion" in data:
                diagrama.descripcion = data["descripcion"]

            # Borrar contenido anterior
            for p in session.scalars(select(SeqParticipante).where(SeqParticipante.id_diagrama == id_diagrama)).all():
                session.delete(p)
            for m in session.scalars(select(SeqMensaje).where(SeqMensaje.id_diagrama == id_diagrama)).all():
                session.delete(m)

            session.flush()


            for p in data.get("participantes", []):
                session.add(SeqParticipante(
                    id_diagrama=id_diagrama,
                    id_nodo=p.get("id", ""),
                    nombre=p.get("nombre", ""),
                    tipo=p.get("tipo", "object"),
                    orden=p.get("orden", 0),
                ))

            # Insertar mensajes
            for m in data.get("mensajes", []):
                session.add(SeqMensaje(
                    id_diagrama=id_diagrama,
                    edge_id=m.get("id", ""),
                    source_id=m.get("source_id", ""),
                    target_id=m.get("target_id", ""),
                    contenido=m.get("contenido", ""),
                    tipo=m.get("tipo", "sync"),
                    orden=m.get("orden", 0),
                    es_self=m.get("es_self", False),
                ))

            session.commit()
            return jsonify({"message": "Diagrama guardado correctamente", "id_diagrama": id_diagrama}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500