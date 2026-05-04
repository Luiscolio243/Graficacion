from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Diagrama import Diagrama
from Models.CasoUsoNodo import CasoUsoNodo
from Models.CasoUsoArista import CasoUsoArista

casos_uml_bp = Blueprint('casos_uml', __name__)


def serializar_nodo(n: CasoUsoNodo) -> dict:
    return {
        "id": n.node_id,
        "type": n.tipo,
        "position": {"x": n.pos_x, "y": n.pos_y},
        "data": {
            "tipo": n.tipo,
            "nombre": n.nombre,
            "ancho": n.ancho,
            "alto": n.alto,
        },
        "style": (
            {"width": n.ancho, "height": n.alto}
            if n.tipo == "system" and n.ancho and n.alto
            else {}
        ),
    }


def serializar_arista(a: CasoUsoArista) -> dict:
    return {
        "id": a.id_edge,
        "source": a.id_source,
        "target": a.id_target,
        "sourceHandle": a.handle_origen,
        "targetHandle": a.handle_destino,
        "data": {"edgeType": a.tipo},
    }


#  GET /diagramas/<id>/casos-uso 
@casos_uml_bp.route('/diagramas/<int:id_diagrama>/casos-uso', methods=['GET'])
def cargar_diagrama_casos_uso(id_diagrama):
    try:
        with Session(engine) as session:
            diagrama = session.scalar(select(Diagrama).where(Diagrama.id_diagrama == id_diagrama))

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404
            if diagrama.tipo != 'casos_uso':
                return jsonify({"error": "BAD REQUEST", "message": "Este diagrama no es de tipo casos_uso"}), 400

            nodos = session.scalars(
                select(CasoUsoNodo).where(CasoUsoNodo.id_diagrama == id_diagrama)
            ).all()

            aristas = session.scalars(
                select(CasoUsoArista).where(CasoUsoArista.id_diagrama == id_diagrama)
            ).all()

            return jsonify({
                "id_diagrama": diagrama.id_diagrama,
                "nombre": diagrama.nombre,
                "descripcion": diagrama.descripcion,
                "nodos": [serializar_nodo(n) for n in nodos],
                "aristas": [serializar_arista(a) for a in aristas],
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


#  PUT /diagramas/<id>/casos-uso 
@casos_uml_bp.route('/diagramas/<int:id_diagrama>/casos-uso', methods=['PUT'])
def guardar_diagrama_casos_uso(id_diagrama):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "BAD REQUEST", "message": "JSON inválido o vacío"}), 400

        with Session(engine) as session:
            diagrama = session.scalar(select(Diagrama).where(Diagrama.id_diagrama == id_diagrama))

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404
            if diagrama.tipo != 'casos_uso':
                return jsonify({"error": "BAD REQUEST", "message": "Este diagrama no es de tipo casos_uso"}), 400

            if "nombre" in data:
                diagrama.nombre = data["nombre"]
            if "descripcion" in data:
                diagrama.descripcion = data["descripcion"]

            # Borrar contenido anterior
            for n in session.scalars(select(CasoUsoNodo).where(CasoUsoNodo.id_diagrama == id_diagrama)).all():
                session.delete(n)
            for a in session.scalars(select(CasoUsoArista).where(CasoUsoArista.id_diagrama == id_diagrama)).all():
                session.delete(a)

            session.flush()

            # Insertar nodos
            for nodo_rf in data.get("nodos", []):
                nd = nodo_rf.get("data", {})
                session.add(CasoUsoNodo(
                    id_diagrama=id_diagrama,
                    node_id=nodo_rf["id"],
                    tipo=nodo_rf.get("type") or nd.get("tipo", "useCase"),
                    nombre=nd.get("nombre", ""),
                    pos_x=nodo_rf.get("position", {}).get("x", 0),
                    pos_y=nodo_rf.get("position", {}).get("y", 0),
                    ancho=nd.get("ancho"),
                    alto=nd.get("alto"),
                ))

            # Insertar aristas
            for arista_rf in data.get("aristas", []):
                session.add(CasoUsoArista(
                    id_diagrama=id_diagrama,
                    id_edge=arista_rf.get("id", ""),
                    id_source=arista_rf.get("source", ""),
                    id_target=arista_rf.get("target", ""),
                    tipo=(arista_rf.get("data") or {}).get("edgeType", "assoc"),
                    handle_origen=arista_rf.get("sourceHandle"),
                    handle_destino=arista_rf.get("targetHandle"),
                ))

            session.commit()
            return jsonify({"message": "Diagrama guardado correctamente", "id_diagrama": id_diagrama}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500