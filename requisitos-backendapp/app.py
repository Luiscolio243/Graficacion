from Models.Proyectos import Proyecto
from Models.ProductOwner import ProductOwner
from Models.Stakeholders import Stakeholders
from Models.tech_leaders import TechLeader
from Models.roles import Roles
from Models.Proceso import Proceso
from Models.Subproceso import Subproceso
from Models.Tecnica import Tecnica
from Models.SubprocesoTecnica import SubprocesoTecnica
from flask_cors import cross_origin, CORS
from sqlalchemy import create_engine,text, select #importamos clase create engine del ORM sqlAlchemy
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from flask import Flask,request, jsonify
import jwt
from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException
from datetime import datetime
import secrets
import string
from Routers.proyectos import proyectos_bp
from Routers.stakeholders import stakeholders_bp
from Routers.procesos import procesos_bp
from Routers.Equipo_ti_router import equipo_ti_bp
from Routers.roles import roles_bp
from Routers.auth import auth_bp
from Routers.entrevistas import entrevistas_bp
from Routers.entrevistaPreguntas import entrevista_preguntas_bp
from Routers.FocusGroup import focus_groups_bp
from Routers.Encuestas import encuestas_bp
from Routers.encuestaPreguntas import encuesta_preguntas_bp
from Routers.responderEncuesta import responder_encuesta_bp
from Routers.Observaciones import observaciones_bp
from Routers.historiasUsuario import historias_bp
from Routers.Seguimiento import seguimiento_bp
from Routers.SubprocesoTecnica import subproceso_tecnica_bp
from Routers.documentos import documentos_router
from Routers.Diagramas import diagramas_bp
from Routers.ClasesUML import clases_uml_bp
from Routers.CasosUML import casos_uml_bp
from Routers.PaquetesUML import paquetes_uml_bp
from Routers.Secuencia import secuencia_uml_bp
from Routers.Specs import specs_bp
from Routers.SpecsArchivos import specs_archivos_bp
from Routers.SpecsTecnicas import specs_tecnicas_bp
from config import Config
try:
    Config.validate()
except EnvironmentError as e:
    print(e)
    exit(1)

#Antes de usar env
#secret_key = "secret"

#Antes de usar env
#engine = create_engine('postgresql+psycopg2://postgres:18052004pau@localhost:5432/Graficacion')

secret_key = Config.SECRET_KEY
engine = create_engine(Config.DATABASE_URL)

app = Flask(__name__)

cors = CORS(app, resources={r"/*": {"origins": "*"}})


app.register_blueprint(proyectos_bp)
app.register_blueprint(stakeholders_bp)
app.register_blueprint(procesos_bp)
app.register_blueprint(equipo_ti_bp)
app.register_blueprint(roles_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(entrevistas_bp)
app.register_blueprint(entrevista_preguntas_bp)
app.register_blueprint(focus_groups_bp)
app.register_blueprint(encuestas_bp)
app.register_blueprint(encuesta_preguntas_bp)
app.register_blueprint(responder_encuesta_bp)
app.register_blueprint(observaciones_bp)
app.register_blueprint(historias_bp)
app.register_blueprint(seguimiento_bp)
app.register_blueprint(subproceso_tecnica_bp)
app.register_blueprint(documentos_router)
app.register_blueprint(diagramas_bp)
app.register_blueprint(clases_uml_bp)
app.register_blueprint(casos_uml_bp)
app.register_blueprint(paquetes_uml_bp)
app.register_blueprint(secuencia_uml_bp)
app.register_blueprint(specs_bp)
app.register_blueprint(specs_archivos_bp)
app.register_blueprint(specs_tecnicas_bp)


class LoginRequest(BaseModel):
    email: str
    password: str

@app.route('/login', methods=['POST'])
@cross_origin()
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

    except Exception as e:
        print(f"Error en login: {type(e).__name__}: {str(e)}")
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

#funcion para correr la app en flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port= Config.FLASK_PORT, debug = True)