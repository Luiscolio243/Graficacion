from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine

from Models.Stakeholders import Stakeholders

stakeholders_bp = Blueprint("stakeholders", __name__)


@stakeholders_bp.route('/stakeholders/agregar', methods=['POST'])
def agregar_stakeholder():
    try:
        data = request.get_json() or {}
        id_proyecto = data.get("id_proyecto")
        nombre = (data.get("nombre") or "").strip()
        apellidos = (data.get("apellidos") or "").strip()
        rol = (data.get("rol") or "").strip()
        tipo = (data.get("tipo") or "Interno").strip()
        correo = (data.get("correo") or data.get("email") or "").strip()
        telefono = (data.get("telefono") or "").strip()
        organizacion = (data.get("organizacion") or "").strip()
        notas = (data.get("notas") or "").strip()

        if not id_proyecto or not nombre:
            return jsonify({"error": "id_proyecto y nombre son requeridos"}), 400

        nombre_completo = f"{nombre} {apellidos}".strip() if apellidos else nombre

        with Session(engine) as session:
            stakeholder = Stakeholders(
                id_proyecto=int(id_proyecto),
                nombre=nombre_completo,
                rol=rol or "Sin rol",
                tipo=tipo,
                email=correo or None,
                telefono=telefono or None,
                organizacion=organizacion or None,
                notas=notas or None,
            )
            session.add(stakeholder)
            session.commit()
            session.refresh(stakeholder)

            return jsonify({
                "mensaje": "Stakeholder creado correctamente",
                "stakeholder": {
                    "id_stakeholder": stakeholder.id_stakeholder,
                    "id_proyecto": stakeholder.id_proyecto,
                    "nombre": stakeholder.nombre,
                    "rol": stakeholder.rol,
                    "tipo": stakeholder.tipo,
                    "email": stakeholder.email,
                    "telefono": stakeholder.telefono,
                    "organizacion": stakeholder.organizacion,
                }
            }), 201
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@stakeholders_bp.route('/stakeholders/<int:id_proyecto>', methods=['GET'])
def obtener_stakeholders(id_proyecto):
    with Session(engine) as session:
        # Filtrar por id_proyecto
        stakeholders = session.scalars(
            select(Stakeholders).where(Stakeholders.id_proyecto == id_proyecto)
        ).all()

        return jsonify([
            {
                "id_stakeholder": s.id_stakeholder,
                "nombre": s.nombre,
                "rol": s.rol,
                "tipo": s.tipo,
                "email": s.email,
                "telefono": s.telefono,
                "organizacion": s.organizacion,
            }
            for s in stakeholders
        ]), 200


@stakeholders_bp.route('/stakeholders/<int:id_stakeholder>', methods=['PUT'])
def editar_stakeholder(id_stakeholder):
    try:
        data = request.get_json() or {}

        nombre = (data.get("nombre") or "").strip()
        apellidos = (data.get("apellidos") or "").strip()
        rol = (data.get("rol") or "").strip()
        tipo = (data.get("tipo") or "").strip()
        correo = (data.get("correo") or data.get("email") or "").strip()
        telefono = (data.get("telefono") or "").strip()
        organizacion = (data.get("organizacion") or "").strip()
        notas = (data.get("notas") or "").strip()

        with Session(engine) as session:
            stakeholder = session.get(Stakeholders, id_stakeholder)
            if stakeholder is None:
                return jsonify({"error": "Stakeholder no encontrado"}), 404

            if nombre:
                stakeholder.nombre = f"{nombre} {apellidos}".strip() if apellidos else nombre
            elif apellidos and stakeholder.nombre:
                stakeholder.nombre = f"{stakeholder.nombre} {apellidos}".strip()

            if rol:
                stakeholder.rol = rol
            if tipo:
                stakeholder.tipo = tipo

            stakeholder.email = correo or None
            stakeholder.telefono = telefono or None
            stakeholder.organizacion = organizacion or None
            stakeholder.notas = notas or None

            session.commit()
            session.refresh(stakeholder)

            return jsonify({
                "mensaje": "Stakeholder actualizado correctamente",
                "stakeholder": {
                    "id_stakeholder": stakeholder.id_stakeholder,
                    "id_proyecto": stakeholder.id_proyecto,
                    "nombre": stakeholder.nombre,
                    "rol": stakeholder.rol,
                    "tipo": stakeholder.tipo,
                    "email": stakeholder.email,
                    "telefono": stakeholder.telefono,
                    "organizacion": stakeholder.organizacion,
                }
            }), 200
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500