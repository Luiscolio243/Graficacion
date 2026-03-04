import jwt
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from db import engine, secret_key
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# El decorador verify_token vive aquí porque está ligado al JWT
def verify_token(func):
    @wraps(func)  # necesario para que Flask no se confunda con los nombres
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

@auth_bp.route('/login', methods=['POST'])
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
                WHERE email = :email AND password_hash = :password
            """)
            result = conn.execute(query, {"email": email, "password": password}).fetchone()

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
        return jsonify({"error": str(e)}), 500