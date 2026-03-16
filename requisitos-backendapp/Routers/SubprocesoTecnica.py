from flask import Blueprint, request,jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from Models.SubprocesoTecnica import SubprocesoTecnica
from db import engine


subproceso_tecnica_bp = Blueprint('suprocesoTecnica', __name__)

@subproceso_tecnica_bp.route('/subprocesoTecnincas/<int:id_subproceso>', methods=['GET'])
def obtener_tecnicas_subprocesos(id_subproceso):
    with Session as session:
        tecn_sbp = session.scalars(
            select(SubprocesoTecnica).where(SubprocesoTecnica.id_subproceso == id_subproceso)
        ).all()
        return jsonify([
            {"id_suproceso_tecnica": st.id_subproceso_tecnica}
            for st in tecn_sbp
        ]), 200

