from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Proyectos import Proyecto
from Models.ProductOwner import ProductOwner
from Models.tech_leaders import TechLeader

proyectos_bp = Blueprint('proyectos', __name__)

@proyectos_bp.route('/proyectos/crear', methods=['POST'])
def crear_proyecto():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        nombre_po = data.get("nombre_po")
        correo_po = data.get("correo_po")
        nombre_tl = data.get("nombre_tl")
        correo_tl = data.get("correo_tl")
        id_usuario = data.get("id_usuario")

        with Session(engine) as session:
            proyecto = Proyecto(
                nombre=nombre,
                descripcion=descripcion,
                objetivo_general=objetivo,
                estado="En progreso",
                id_creador=id_usuario
            )
            session.add(proyecto)
            session.commit()
            session.refresh(proyecto)

            product_owner = ProductOwner(
                id_proyecto=proyecto.id_proyecto,
                id_usuario=id_usuario,
                nombre=nombre_po,
                correo=correo_po
            )
            session.add(product_owner)

            tech_leader = TechLeader(
                id_proyecto=proyecto.id_proyecto,
                id_usuario=id_usuario,
                nombre=nombre_tl,
                correo=correo_tl
            )
            session.add(tech_leader)
            session.commit()

        return jsonify({"mensaje": "Proyecto creado correctamente", "id": proyecto.id_proyecto}), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@proyectos_bp.route('/proyectos/obtener', methods=['GET'])
def obtener_proyectos():
    with Session(engine) as session:
        proyectos = session.scalars(select(Proyecto)).all()
        return jsonify([
            {"id_proyecto": p.id_proyecto, "nombre": p.nombre, "estado": p.estado, "descripcion": p.descripcion}
            for p in proyectos
        ]), 200


@proyectos_bp.route('/proyectos/<int:id_proyecto>', methods=['GET'])
def obtener_proyecto(id_proyecto):
    with Session(engine) as session:
        proyecto = session.get(Proyecto, id_proyecto)
        if not proyecto:
            return jsonify({"error": "No se encontró el proyecto"}), 404
        return jsonify({
            "id_proyecto": proyecto.id_proyecto,
            "nombre": proyecto.nombre,
            "estado": proyecto.estado,
            "descripcion": proyecto.descripcion
        }), 200


@proyectos_bp.route('/productowner/<int:id_proyecto>', methods=['GET'])
def obtener_product_owner(id_proyecto):
    with Session(engine) as session:
        po = session.query(ProductOwner).filter(ProductOwner.id_proyecto == id_proyecto).first()
        if po is None:
            return jsonify({"mensaje": "No se encontró un product owner en este proyecto"}), 404
        return jsonify({"id": po.id_product_owner, "nombre": po.nombre, "id_proyecto": po.id_proyecto, "correo": po.correo})


@proyectos_bp.route('/tech_leaders/<int:id_proyecto>', methods=['GET'])
def obtener_tech_leader(id_proyecto):
    with Session(engine) as session:
        tl = session.query(TechLeader).filter(TechLeader.id_proyecto == id_proyecto).first()
        if tl is None:
            return jsonify({"mensaje": "No se encontró un tech leader en este proyecto"}), 404
        return jsonify({"id": tl.id_tech_leader, "nombre": tl.nombre, "id_proyecto": tl.id_proyecto})