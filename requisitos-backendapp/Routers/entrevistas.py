from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from db import engine
from Models.Entrevistas import (Entrevistas)
from sqlalchemy.exc import SQLAlchemyError

entrevistas_bp = Blueprint('entrevistas', __name__)

@entrevistas_bp.route('/entrevistas/<int:id_proyecto>', methods=['GET'])
def obtener_entrevistas(id_proyecto):
    with Session(engine) as session:
        entrevistas = session.scalars(
            select(Entrevistas).where(Entrevistas.id_proyecto == id_proyecto)
        ).all()
        return jsonify([
            {"id_entrevista": e.id_entrevista, "titulo": e.titulo,
             "fecha_programada": e.fecha_programada, "fecha_realizada": e.fecha_realizada}
            for e in entrevistas
        ]), 200


@entrevistas_bp.route('/entrevistas/crear/<int:id_subproceso>', methods=['GET'])
def crear_entrevistas(id_subproceso):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON invalido"}), 400   #400 seria por error del cliente al hacer el request

        id_proyecto = data.get("id_proyecto")
        id_subproceso = id_subproceso
        id_stakeholder = data.get("id_stakeholder")
        id_entrevistador = data.get("id_entrevistador")
        fecha_programada = data.get("fecha_programada")
        lugar = data.get("lugar")
        objetivo = data.get("objetivo")
        estado = "pendiente"
        titulo = "default"

        with Session(engine) as session:
            entrevista = Entrevistas(
                id_proyecto = id_proyecto,
                id_subproceso = id_subproceso,
                id_stakeholder = id_stakeholder,
                id_entrevistador = id_entrevistador,
                fecha_programada = fecha_programada,
                lugar = lugar,
                objetivo = objetivo,
                estado = estado,
                titulo = titulo
            )
            session.add(entrevista)
            session.commit()
            session.refresh(entrevista)

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

