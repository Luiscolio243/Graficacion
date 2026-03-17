from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from db import engine
from Models.roles import Roles

roles_bp = Blueprint('roles', __name__)


#ruta para crear rol
@roles_bp.route('/roles/agregar', methods=['POST'])
def agregar_roles():
    try:
        data = request.get_json() #obtiene json del front

        #si no esta bien el json da error
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        #extrae los campos 
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")

        #valida si tiene el nombre porque pues es obligatorio
        if not nombre:
            return jsonify({"error": "Nombre requerido"}), 400

        #se abre la sesion del orm con la bd 
        with Session(engine) as session:
            #modelo de roles
            rol = Roles(
                nombre=nombre,
                descripcion=descripcion
            )

            session.add(rol) #agrega a la sesion
            session.commit() #hace el insert
            session.refresh(rol) #se refresca para obtener el id 

            #devuelve la respuesta que se creo
            return jsonify({
                "id": rol.id_rol,
                "nombre": rol.nombre,
                "descripcion": rol.descripcion
            }), 201

    #si hay error lo captura
    except Exception as e:
        print("ERROR REAL:", str(e))
        return jsonify({"error": "Error interno"}), 500


#Ruta para obtener los roles 
@roles_bp.route('/roles/obtener', methods=['GET', 'POST'])
def obtener_roles():
    # Pongo esta ruta por mientras porque devuelve todos los roles.
    with Session(engine) as session: #sesion de la orm 
        roles = session.scalars(select(Roles)).all() #select de los roles
        return jsonify([ #devuelve lista de los roles 
            {
                "id_rol": r.id_rol,
                "nombre": r.nombre,
                "descripcion": r.descripcion
            }
            for r in roles
        ]), 200