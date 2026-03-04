from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from db import engine
from Models.roles import Roles

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('/roles/agregar', methods=['POST'])
def agregar_roles():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        nombre = data.get("nombre")
        descripcion = data.get("descripcion")

        if not nombre:
            return jsonify({"error": "Nombre requerido"}), 400

        with Session(engine) as session:
            rol = Roles(nombre=nombre, descripcion=descripcion)
            session.add(rol)
            session.commit()
            session.refresh(rol)
            return jsonify({"id": rol.id_rol, "nombre": rol.nombre, "descripcion": rol.descripcion}), 201

    except Exception as e:
        return jsonify({"error": "Error interno"}), 500


@roles_bp.route('/roles/obtener', methods=['GET'])
def obtener_roles():
    with Session(engine) as session:
        roles = session.scalars(select(Roles)).all()
        return jsonify([
            {"id_rol": r.id_rol, "nombre": r.nombre, "descripcion": r.descripcion}
            for r in roles
        ]), 200