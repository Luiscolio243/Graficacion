from flask import Blueprint, jsonify, request
from db import engine
from sqlalchemy.orm import Session
from Models.Seguimiento import Seguimiento
from Models.SeguimientoPaso import SeguimientoPaso
from Models.SeguimientoProblema import SeguimientoProblema
from Models.SeguimientoMetrica import SeguimientoMetrica


seguimiento_bp = Blueprint('seguimiento', __name__)

def serializar_seguimiento_lista(s):
    # Para la pantalla de lista (solo datos principales)
    return {
        "id_seguimiento":   s.id_seguimiento,
        "titulo":         s.titulo,
        "id_transaccion": s.id_transaccion,
        "nombre_proceso": s.nombre_proceso,
        "fecha_creacion": str(s.fecha_creacion) if s.fecha_creacion else None,
    }


def serializar_paso(paso):
    return {
        "id": paso.id,
        "nombre": paso.nombre,
        "duracion_min": paso.duracion_min,
        "orden": paso.orden,
    }


def serializar_problema(problema):
    return {
        "id": problema.id,
        "descripcion": problema.descripcion,
    }


def serializar_metrica(metrica):
    return {
        "id": metrica.id,
        "nombre": metrica.nombre,
        "valor": metrica.valor,
    }

def serializar_seguimiento_detalle(s):
    return {
        "id":             s.id,
        "titulo":         s.titulo,
        "id_transaccion": s.id_transaccion,
        "nombre_proceso": s.nombre_proceso,
        "id_proceso":     s.id_proceso,
        "id_subproceso":  s.id_subproceso,
        "fecha_creacion": str(s.fecha_creacion) if s.fecha_creacion else None,
        "pasos":          [serializar_paso(p)     for p in s.pasos],
        "problemas":      [serializar_problema(p) for p in s.problemas],
        "metricas":       [serializar_metrica(m)  for m in s.metricas],
    }



def obtener_seguimientos(id_proyecto):
    try:
        with Session(engine) as session:
            seguimientos = session.query(Seguimiento).filter(
                Seguimiento.id_proyecto == id_proyecto
            ).all()

            return jsonify([serializar_seguimiento_lista(s) for s in seguimientos]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@seguimiento_bp.route('/seguimientos/<int:id_proyecto>/<int:id_seguimiento>', methods=['GET'])
def obtener_seguimiento(id_proyecto, id_seguimiento):
    try:
        with Session(engine) as session:
            seguimiento = session.query(Seguimiento).filter(
                Seguimiento.id == id_seguimiento,
                Seguimiento.id_proyecto == id_proyecto
            ).first()

            if not seguimiento:
                return jsonify({"error": "Seguimiento no encontrado"}), 404

            return jsonify(serializar_seguimiento_detalle(seguimiento)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



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



@seguimiento_bp.route('/seguimientos/crear/<int:id_proyecto>', methods=['POST'])
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
                    nombre = paso.get('nombre'),
                    duracion_min = paso.get('duracion_min'),
                    orden = paso.get('orden', 1),
                ))

            for problema in data.get('problemas', []):
                session.add(SeguimientoProblema(
                    id_seguimiento=nuevo_seguimiento.id_seguimiento,
                    descripcion=problema.get('descripcion'),
                ))

            for metrica in data.get('metricas', []):
                session.add(SeguimientoMetrica(
                    id_seguimiento=nuevo_seguimiento.id_seguimiento,
                    nombre=metrica.get('nombre'),
                    valor=metrica.get('valor'),
                ))

            session.commit()
            session.refresh(nuevo_seguimiento)
            return jsonify(serializar_seguimiento_lista(nuevo_seguimiento)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500