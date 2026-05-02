from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Diagrama import Diagrama

diagramas_bp = Blueprint('diagramas', __name__)


def serializar_diagrama(d: Diagrama) -> dict:
    return {
        "id_diagrama": d.id_diagrama,
        "nombre": d.nombre,
        "descripcion": d.descripcion,
        "tipo": d.tipo,
        "creado_en": d.creado_en.isoformat() if d.creado_en else None,
        "editado_en": d.editado_en.isoformat() if d.editado_en else None,
    }


# ─── GET /diagramas ───────────────────────────────────────────────────────────
@diagramas_bp.route('/diagramas', methods=['GET'])
def listar_diagramas():
    try:
        tipo = request.args.get('tipo')  # ?tipo=clases  (opcional)

        with Session(engine) as session:
            stmt = select(Diagrama).order_by(Diagrama.editado_en.desc())
            if tipo:
                stmt = stmt.where(Diagrama.tipo == tipo)

            diagramas = session.scalars(stmt).all()
            return jsonify([serializar_diagrama(d) for d in diagramas]), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# ─── POST /diagramas/crear ────────────────────────────────────────────────────
@diagramas_bp.route('/diagramas/crear', methods=['POST'])
def crear_diagrama():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "BAD REQUEST", "message": "El JSON enviado es inválido o vacío"}), 400

        campos_obligatorios = ["nombre", "tipo"]
        faltantes = [c for c in campos_obligatorios if not data.get(c)]
        if faltantes:
            return jsonify({"error": "BAD REQUEST", "message": f"Faltan campos obligatorios: {faltantes}"}), 400

        tipos_validos = ('clases', 'paquetes', 'casos_uso', 'secuencia')
        if data["tipo"] not in tipos_validos:
            return jsonify({"error": "BAD REQUEST", "message": f"tipo debe ser uno de: {tipos_validos}"}), 400

        with Session(engine) as session:
            diagrama = Diagrama(
                nombre=data["nombre"],
                descripcion=data.get("descripcion", ""),
                tipo=data["tipo"],
            )
            session.add(diagrama)
            session.commit()
            session.refresh(diagrama)

            return jsonify({
                "message": "Diagrama creado exitosamente",
                "diagrama": serializar_diagrama(diagrama)
            }), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# ─── DELETE /diagramas/<id> ───────────────────────────────────────────────────
@diagramas_bp.route('/diagramas/<int:id_diagrama>', methods=['DELETE'])
def eliminar_diagrama(id_diagrama):
    try:
        with Session(engine) as session:
            stmt = select(Diagrama).where(Diagrama.id_diagrama == id_diagrama)
            diagrama = session.scalar(stmt)

            if not diagrama:
                return jsonify({"error": "No encontrado", "message": "El diagrama no existe"}), 404

            session.delete(diagrama)
            session.commit()
            return jsonify({"message": "Diagrama eliminado correctamente"}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
