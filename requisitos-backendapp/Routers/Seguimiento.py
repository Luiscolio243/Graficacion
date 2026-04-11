from flask import Blueprint, jsonify, request
from db import engine
from sqlalchemy.orm import Session
from Models.Seguimiento import Seguimiento


seguimiento_bp = Blueprint('seguimiento', __name__)

def serializar_seguimiento_lista(s):
    # Para la pantalla de lista (solo datos principales)
    return {
        "id_seguimiento":   s.id,
        "titulo":         s.titulo,
        "id_transaccion": s.id_transaccion,
        "nombre_proceso": s.nombre_proceso,
        "fecha_creacion": str(s.fecha_creacion) if s.fecha_creacion else None,
    }


@seguimiento_bp.route('/seguimientos/obtener/<int:id_proyecto>', methods=['GET'])
def obtener_seguimientos(id_proyecto):
    try:
        with Session(engine) as session:
            seguimientos = session.query(Seguimiento).filter(
                Seguimiento.id_proyecto == id_proyecto
            ).all()

            return jsonify([serializar_seguimiento_lista(s) for s in seguimientos]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@seguimiento_bp.route('/seguimientos/<int:id_proyecto>', methods=['POST'])
def crear_seguimiento(id_proyecto):
    try:
        data = request.get_json()

        with Session(engine) as session:
            nuevo_seguimiento = Seguimiento(
                id_proyecto =   id_proyecto,
                titulo  = data.get('titulo'),
                id_transaccion = data.get('id_transaccion'),
                nombre_proceso = data.get('nombre_proceso'),
                id_proceso = data.get('id_proceso'),
                id_subproceso = data.get('id_subproceso')
            )

            session.add(nuevo_seguimiento)
            session.flush()

            for paso in data.get('pasos', []):
                session.add(SeguimientoPaso(
                    id_seguimiento = nuevo_seguimiento.id_seguimiento,
                    
                ))