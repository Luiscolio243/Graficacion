from flask import Blueprint, request, jsonify
from sqlalchemy.orm import session
from sqlAlchemy import select
from Models.personal_ti import personal_ti
from database import engine

equipo_ti_bp = Blueprint("equipo_ti", __name__) #creacion de modulo

#use el blueprint para que se organizado mas el backend y no tenga despues problemas con los imports
#registro personas del equipo de ti
@equipo_ti_bp.route('/equipo-ti/agregar', methods=['POST'])
def agregar_personal_ti():

    data = request.get_json()

    id_proyecto = data.get("id_proyecto")
    id_tech_leader = data.get("id_tech_leader")
    id_usuario = data.get("id_usuario")
    id_rol = data.get("id_rol")
    nombre = data.get("nombre")
    correo = data.get("correo")

    with Session(engine) as session:

        nuevo = PersonalTI(
            id_proyecto=id_proyecto,
            id_tech_leader=id_tech_leader,
            id_usuario=id_usuario,
            id_rol=id_rol,
            nombre=nombre,
            correo=correo
        )

        session.add(nuevo)
        session.commit()
        session.refresh(nuevo)

        return jsonify({
            "mensaje": "Miembro agregado al equipo TI",
            "id": nuevo.id_personal_ti
        }), 201


@equipo_ti_bp.route('/equipo-ti/<int:id_proyecto>', methods=['GET'])
def obtener_equipo(id_proyecto):

    with Session(engine) as session:
        equipo = session.scalars(
            select(PersonalTI).where(PersonalTI.id_proyecto == id_proyecto)
        ).all()

        return jsonify([
            {
                "id": p.id_personal_ti,
                "nombre": p.nombre,
                "id_usuario": p.id_usuario,
                "id_rol": p.id_rol
            }
            for p in equipo
        ]), 200