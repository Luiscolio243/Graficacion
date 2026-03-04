from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from db import engine
from Models.Stakeholders import Stakeholders

stakeholders_bp = Blueprint('stakeholders', __name__)

@stakeholders_bp.route('/stakeholders/<int:id_proyecto>', methods=['GET'])
def obtener_stakeholders(id_proyecto):
    with Session(engine) as session:
        stakeholders = session.scalars(
            select(Stakeholders).where(Stakeholders.id_proyecto == id_proyecto)
        ).all()
        return jsonify([
            {"id_stakeholder": s.id_stakeholder, "nombre": s.nombre,
             "rol": s.rol, "tipo": s.tipo, "email": s.email}
            for s in stakeholders
        ]), 200