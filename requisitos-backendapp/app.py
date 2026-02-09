from itertools import product

from flask_cors import cross_origin, CORS
from sqlalchemy import create_engine,text, select #importamos clase create engine del ORM sqlAlchemy
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from flask import Flask,request, jsonify
import jwt
from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException
from Models.Proyectos import Proyecto
from Models.ProductOwner import ProductOwner



secret_key = "secret"

engine = create_engine('postgresql+psycopg2://postgres:root\
@localhost:5432/Graficacion')

app = Flask(__name__)

cors = CORS(app, resources={r"/*": {"origins": "*"}})

class LoginRequest(BaseModel):
    email: str
    password: str

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email y password requeridos"}), 400

        with engine.connect() as conn:
            query = text("""
                SELECT id_usuario, nombre, email, apellido
                FROM usuarios
                WHERE email = :email
                AND password_hash = :password
            """)

            result = conn.execute(
                query,
                {"email": email, "password": password}
            ).fetchone()

            if result is None:
                return jsonify({"error": "Email o password incorrectos"}), 401

            token = jwt.encode({'username': result.nombre}, secret_key, algorithm='HS256')

            return jsonify({
                "message": "Login exitoso",
                "user": {
                    "id": result.id_usuario,
                    "nombre": result.nombre,
                    "apellido": result.apellido,
                    "email": result.email
                },
                "token": token

            }), 200

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500





def verify_token(func):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization', '')
        if not token:
            return jsonify({'message': 'Token not provided'}), 401
        token_parts = token.split(" ")
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({'message': 'Invalid token format'}), 401
        token = token_parts[1]
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            request.username = payload['username']
            return func(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 403
    return wrapper


@app.route('/proyectos/crear', methods=['POST'])
def crear_proyecto():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        nombre = data.get("nombre")
        descripcion = data.get("password")
        objetivo = data.get("objetivo")
        organizacion = data.get("organizacion")

        nombre_po = data.get("nombre_po")
        apellidos_po = data.get("apellidos_po")
        correo_po = data.get("correo_po")
        telefono_po = data.get("telefono_po")

        nombre_tl = data.get("nombre_tl")
        apellidos_tl = data.get("apellidos_tl")
        correo_tl = data.get("correo_tl")
        telefono_tl = data.get("telefono_tl")

        id_usuario = data.get("id_usuario")

        with Session(engine) as session:
            proyecto = Proyecto(
                nombre= nombre,
                descripcion = descripcion,
                objetivo_general = objetivo,
                estado= "En progreso",
                id_creador=1

            )

            session.add(proyecto)
            session.commit()
            session.refresh(proyecto)

        with Session(engine) as session:
            product_owner = ProductOwner(
                id_proyecto= proyecto.id_proyecto,
                id_usuario= id_usuario,
                nombre= nombre_po,
                correo= correo_po
            )

        return jsonify({
            "mensaje": "Proyecto creado correctamente",
            "id": proyecto.id_proyecto
        }), 201
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500



@app.route('/proyectos/obtener', methods=['GET'])
def obtener_proyetos():
    with Session(engine) as session:
        proyectos = session.scalars(select(Proyecto)).all()

        return[
        {
            "id_proyecto": p.id_proyecto,
            "nombre": p.nombre,
            "estado": p.estado,
            "descripcion": p.descripcion
        }
        for p in proyectos
    ], 200


@app.route('/productowner/<int:id>', methods=['GET'])
def obtener_product_owner_proyecto(id):
    with Session(engine) as session:
        product_owner = ProductOwner(

        )





#funcion para correr la app en flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 5000, debug = True)