from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.ProyectoSpecsTecnicas import ProyectoSpecsTecnicas

specs_tecnicas_bp = Blueprint('specs_tecnicas', __name__)


def serializar(s: ProyectoSpecsTecnicas) -> dict:
    return {
        "id_specs_tecnicas": s.id_specs_tecnicas,
        "id_proyecto": s.id_proyecto,
        "frontend_framework": s.frontend_framework,
        "frontend_libreria_ui": s.frontend_libreria_ui,
        "frontend_manejo_estado": s.frontend_manejo_estado,
        "backend_lenguaje": s.backend_lenguaje,
        "backend_framework": s.backend_framework,
        "backend_tipo_api": s.backend_tipo_api,
        "bd_motor": s.bd_motor,
        "bd_orm": s.bd_orm,
        "seg_autenticacion": s.seg_autenticacion,
        "seg_roles": s.seg_roles,
        "seg_cifrado": s.seg_cifrado,
        "infra_despliegue": s.infra_despliegue,
        "infra_contenedores": s.infra_contenedores,
        "restricciones_adicionales": s.restricciones_adicionales,
    }


#  GET /proyectos/<id>/specs-tecnicas 
@specs_tecnicas_bp.route('/proyectos/<int:id_proyecto>/specs-tecnicas', methods=['GET'])
def obtener_specs_tecnicas(id_proyecto):
    try:
        with Session(engine) as session:
            specs = session.scalar(
                select(ProyectoSpecsTecnicas)
                .where(ProyectoSpecsTecnicas.id_proyecto == id_proyecto)
            )
            if not specs:
                return jsonify(None), 200
            return jsonify(serializar(specs)), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


# POST /proyectos/<id>/specs-tecnicas 
@specs_tecnicas_bp.route('/proyectos/<int:id_proyecto>/specs-tecnicas', methods=['POST'])
def guardar_specs_tecnicas(id_proyecto):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        with Session(engine) as session:
            # Si ya existe, actualiza
            existing = session.scalar(
                select(ProyectoSpecsTecnicas)
                .where(ProyectoSpecsTecnicas.id_proyecto == id_proyecto)
            )

            if existing:
                for campo in [
                    'frontend_framework', 'frontend_libreria_ui', 'frontend_manejo_estado',
                    'backend_lenguaje', 'backend_framework', 'backend_tipo_api',
                    'bd_motor', 'bd_orm',
                    'seg_autenticacion', 'seg_roles', 'seg_cifrado',
                    'infra_despliegue', 'infra_contenedores',
                    'restricciones_adicionales',
                ]:
                    if campo in data:
                        setattr(existing, campo, data[campo])
                session.commit()
                return jsonify({"message": "Specs técnicas actualizadas", "specs": serializar(existing)}), 200
            else:
                specs = ProyectoSpecsTecnicas(
                    id_proyecto=id_proyecto,
                    frontend_framework=data.get('frontend_framework'),
                    frontend_libreria_ui=data.get('frontend_libreria_ui'),
                    frontend_manejo_estado=data.get('frontend_manejo_estado'),
                    backend_lenguaje=data.get('backend_lenguaje'),
                    backend_framework=data.get('backend_framework'),
                    backend_tipo_api=data.get('backend_tipo_api'),
                    bd_motor=data.get('bd_motor'),
                    bd_orm=data.get('bd_orm'),
                    seg_autenticacion=data.get('seg_autenticacion'),
                    seg_roles=data.get('seg_roles'),
                    seg_cifrado=data.get('seg_cifrado'),
                    infra_despliegue=data.get('infra_despliegue'),
                    infra_contenedores=data.get('infra_contenedores'),
                    restricciones_adicionales=data.get('restricciones_adicionales'),
                )
                session.add(specs)
                session.commit()
                session.refresh(specs)
                return jsonify({"message": "Specs técnicas guardadas", "specs": serializar(specs)}), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500