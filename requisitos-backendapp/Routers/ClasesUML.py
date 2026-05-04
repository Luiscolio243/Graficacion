from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Diagrama import Diagrama
from Models.ClaseNodo import ClaseNodo
from Models.ClaseArista import ClaseArista
from Models.ClaseNodoMetodo import ClaseNodoMetodo
from Models.ClaseNodoAtributo import ClaseNodoAtributo


clases_uml_bp = Blueprint('clases_uml', __name__)


def serializar_nodo(nodo: ClaseNodo) -> dict:
    return {
        "id": nodo.node_id,
        "type": "classNode",
        "position": {"x": nodo.pos_x, "y": nodo.pos_y},
        "data": {
            "type": nodo.tipo,
            "name": nodo.nombre,
            "attrs": [
                {"v": a.visibilidad, "n": a.nombre, "t": a.tipo_dato}
                for a in nodo.atributos
            ],
            "methods": [
                {"v": m.visibilidad, "n": m.nombre, "t": m.tipo_dato, "ab": m.es_abstracto}
                for m in nodo.metodos
            ],
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


# ─── GET /diagramas/<id>/clases ───────────────────────────────────────────────
@clases_uml_bp.route('/diagramas/<int:id_diagrama>/clases', methods=['GET'])
def cargar_diagrama_clases(id_diagrama):
    try:
        with Session(engine) as session:
            stmt = select(Diagrama).where(Diagrama.id_diagrama == id_diagrama)
            diagrama = session.scalar(stmt)

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404
            if diagrama.tipo != 'clases':
                return jsonify({"error": "BAD REQUEST", "message": "Este diagrama no es de tipo clases"}), 400

            stmt_nodos = select(ClaseNodo).where(ClaseNodo.id_diagrama == id_diagrama)
            nodos = session.scalars(stmt_nodos).all()

            stmt_aristas = select(ClaseArista).where(ClaseArista.id_diagrama == id_diagrama)
            aristas = session.scalars(stmt_aristas).all()

            return jsonify({
                "id_diagrama": diagrama.id_diagrama,
                "nombre": diagrama.nombre,
                "descripcion": diagrama.descripcion,
                "nodos": [serializar_nodo(n) for n in nodos],
                "aristas": [serializar_arista(a) for a in aristas],
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# ─── PUT /diagramas/<id>/clases ───────────────────────────────────────────────
# Recibe exactamente el estado de ReactFlow: { nombre?, descripcion?, nodos:[], aristas:[] }
@clases_uml_bp.route('/diagramas/<int:id_diagrama>/clases', methods=['PUT'])
def guardar_diagrama_clases(id_diagrama):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "BAD REQUEST", "message": "El JSON enviado es inválido o vacío"}), 400

        with Session(engine) as session:
            stmt = select(Diagrama).where(Diagrama.id_diagrama == id_diagrama)
            diagrama = session.scalar(stmt)

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404
            if diagrama.tipo != 'clases':
                return jsonify({"error": "BAD REQUEST", "message": "Este diagrama no es de tipo clases"}), 400

            # Actualizar metadata si vienen
            if "nombre" in data:
                diagrama.nombre = data["nombre"]
            if "descripcion" in data:
                diagrama.descripcion = data["descripcion"]

            # Borrar contenido anterior — la cascada elimina atributos y métodos
            stmt_del_nodos = select(ClaseNodo).where(ClaseNodo.id_diagrama == id_diagrama)
            stmt_del_aristas = select(ClaseArista).where(ClaseArista.id_diagrama == id_diagrama)

            for nodo in session.scalars(stmt_del_nodos).all():
                session.delete(nodo)
            for arista in session.scalars(stmt_del_aristas).all():
                session.delete(arista)

            session.flush()

            # Insertar nodos nuevos
            # Cada nodo viene como: { id, type, position:{x,y}, data:{type, name, attrs, methods} }
            for nodo_rf in data.get("nodos", []):
                nodo_data = nodo_rf.get("data", {})

                nodo = ClaseNodo(
                    id_diagrama=id_diagrama,
                    node_id=nodo_rf["id"],
                    tipo=nodo_data.get("type", "class"),
                    nombre=nodo_data.get("name", ""),
                    pos_x=nodo_rf.get("position", {}).get("x", 0),
                    pos_y=nodo_rf.get("position", {}).get("y", 0),
                )
                session.add(nodo)
                session.flush()  # para obtener id_clase_nodo

                for i, attr in enumerate(nodo_data.get("attrs", [])):
                    session.add(ClaseNodoAtributo(
                        id_clase_nodo=nodo.id_clase_nodo,
                        visibilidad=attr.get("v", "+"),
                        nombre=attr.get("n", ""),
                        tipo_dato=attr.get("t", ""),
                        orden=i,
                    ))

                for i, met in enumerate(nodo_data.get("methods", [])):
                    session.add(ClaseNodoMetodo(
                        id_clase_nodo=nodo.id_clase_nodo,
                        visibilidad=met.get("v", "+"),
                        nombre=met.get("n", ""),
                        tipo_dato=met.get("t", ""),
                        es_abstracto=met.get("ab", False),
                        orden=i,
                    ))

            # Insertar aristas nuevas
            # Cada arista viene como: { id, source, target, label, data:{edgeType} }
            for arista_rf in data.get("aristas", []):
                session.add(ClaseArista(
                    id_diagrama=id_diagrama,
                    id_edge=arista_rf.get("id", ""),
                    id_source=arista_rf.get("source", ""),
                    id_target=arista_rf.get("target", ""),
                    tipo=(arista_rf.get("data") or {}).get("edgeType", "assoc"),
                    etiqueta=arista_rf.get("label", ""),
                ))

            session.commit()

            return jsonify({
                "message": "Diagrama guardado correctamente",
                "id_diagrama": id_diagrama,
            }), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500