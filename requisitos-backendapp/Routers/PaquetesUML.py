from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Diagrama import Diagrama
from Models.PaqueteNodo import PaqueteNodo
from Models.PaqueteNodoElemento import PaqueteNodoElemento
from Models.ClaseArista import ClaseArista

paquetes_uml_bp = Blueprint('paquetes_uml', __name__)


def serializar_nodo(nodo: PaqueteNodo) -> dict:
    return {
        "id": nodo.node_id,
        "type": "packageNode",
        "position": {"x": nodo.pos_x, "y": nodo.pos_y},
        "data": {
            "name": nodo.nombre,
            "classes": [e.nombre for e in nodo.elementos],
        }
    }


def serializar_arista(arista: ClaseArista) -> dict:
    return {
        "id": arista.id_edge,
        "source": arista.id_source,
        "target": arista.id_target,
        "type": "smoothstep",
        "label": arista.etiqueta or "",
        "data": {"edgeType": arista.tipo},
    }


# ─── GET /diagramas/<id>/paquetes ─────────────────────────────────────────────
@paquetes_uml_bp.route('/diagramas/<int:id_diagrama>/paquetes', methods=['GET'])
def cargar_diagrama_paquetes(id_diagrama):
    try:
        with Session(engine) as session:
            diagrama = session.scalar(
                select(Diagrama).where(Diagrama.id_diagrama == id_diagrama)
            )
            if not diagrama:
                return jsonify({"error": "No encontrado"}), 404
            if diagrama.tipo != 'paquetes':
                return jsonify({"error": "Este diagrama no es de tipo paquetes"}), 400

            nodos = session.scalars(
                select(PaqueteNodo).where(PaqueteNodo.id_diagrama == id_diagrama)
            ).all()
            aristas = session.scalars(
                select(ClaseArista).where(ClaseArista.id_diagrama == id_diagrama)
            ).all()

            return jsonify({
                "id_diagrama": diagrama.id_diagrama,
                "nombre": diagrama.nombre,
                "nodos": [serializar_nodo(n) for n in nodos],
                "aristas": [serializar_arista(a) for a in aristas],
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# ─── PUT /diagramas/<id>/paquetes ─────────────────────────────────────────────
# Body: { nombre?, nodos: [...], aristas: [...] }
@paquetes_uml_bp.route('/diagramas/<int:id_diagrama>/paquetes', methods=['PUT'])
def guardar_diagrama_paquetes(id_diagrama):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido o vacío"}), 400

        with Session(engine) as session:
            diagrama = session.scalar(
                select(Diagrama).where(Diagrama.id_diagrama == id_diagrama)
            )
            if not diagrama:
                return jsonify({"error": "No encontrado"}), 404
            if diagrama.tipo != 'paquetes':
                return jsonify({"error": "Este diagrama no es de tipo paquetes"}), 400

            if "nombre" in data:
                diagrama.nombre = data["nombre"]

            # Borrar nodos y aristas anteriores
            for nodo in session.scalars(select(PaqueteNodo).where(PaqueteNodo.id_diagrama == id_diagrama)).all():
                session.delete(nodo)
            for arista in session.scalars(select(ClaseArista).where(ClaseArista.id_diagrama == id_diagrama)).all():
                session.delete(arista)
            session.flush()

            # Insertar nodos nuevos
            # Cada nodo: { id, type, position:{x,y}, data:{name, classes:[]} }
            for nodo_rf in data.get("nodos", []):
                nodo_data = nodo_rf.get("data", {})
                nodo = PaqueteNodo(
                    id_diagrama=id_diagrama,
                    node_id=nodo_rf["id"],
                    nombre=nodo_data.get("name", ""),
                    pos_x=nodo_rf.get("position", {}).get("x", 0),
                    pos_y=nodo_rf.get("position", {}).get("y", 0),
                )
                session.add(nodo)
                session.flush()

                for i, nombre_el in enumerate(nodo_data.get("classes", [])):
                    session.add(PaqueteNodoElemento(
                        id_paquete_nodo=nodo.id_paquete_nodo,
                        nombre=nombre_el,
                        orden=i,
                    ))

            # Insertar aristas nuevas
            # Cada arista: { id, source, target, label, data:{edgeType} }
            for arista_rf in data.get("aristas", []):
                session.add(ClaseArista(
                    id_diagrama=id_diagrama,
                    id_edge=arista_rf.get("id", ""),
                    id_source=arista_rf.get("source", ""),
                    id_target=arista_rf.get("target", ""),
                    tipo=(arista_rf.get("data") or {}).get("edgeType", "use"),
                    etiqueta=arista_rf.get("label", ""),
                ))

            session.commit()
            return jsonify({"message": "Diagrama guardado", "id_diagrama": id_diagrama}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
