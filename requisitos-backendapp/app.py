from flask_cors import cross_origin, CORS
from sqlalchemy import create_engine,text #importamos clase create engine del ORM sqlAlchemy
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from flask import Flask,request, jsonify
import jwt
from fastapi import FastAPI, HTTPException


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




@app.route('/protected', methods=['GET'])
@verify_token
def protected():
    return jsonify({'message': 'You have access'}), 200



#funcion para correr la app en flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 5000, debug = True)