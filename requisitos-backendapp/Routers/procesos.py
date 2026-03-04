from flask import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from db import engine
from Models.Proceso import Proceso
from Models.Subproceso import Subproceso
from Models.Tecnica import Tecnica
from Models.SubprocesoTecnica import SubprocesoTecnica

procesos_bp = Blueprint('procesos', __name__)

@procesos_bp.route('/procesos/crear', methods=['POST'])
def crear_proceso():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        id_proyecto = data.get("id_proyecto")
        nombre = data.get("nombre")
        if not id_proyecto or not nombre:
            return jsonify({"error": "id_proyecto y nombre son requeridos"}), 400

        with Session(engine) as session:
            proceso = Proceso(
                id_proyecto=id_proyecto, nombre=nombre,
                descripcion=data.get("descripcion"), objetivo=data.get("objetivo"),
                area_responsable=data.get("area"), id_responsable=data.get("responsableId"),
                estado='activo'
            )
            session.add(proceso)
            session.commit()
            session.refresh(proceso)
            return jsonify({"mensaje": "Proceso creado correctamente", "id_proceso": proceso.id_proceso, "nombre": proceso.nombre}), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@procesos_bp.route('/procesos/<int:id_proyecto>', methods=['GET'])
def obtener_procesos(id_proyecto):
    try:
        with Session(engine) as session:
            procesos = session.scalars(select(Proceso).where(Proceso.id_proyecto == id_proyecto)).all()
            procesos_data = []
            for proceso in procesos:
                subprocesos = session.scalars(select(Subproceso).where(Subproceso.id_proceso == proceso.id_proceso)).all()
                subprocesos_data = []
                for subproceso in subprocesos:
                    sts = session.scalars(select(SubprocesoTecnica).where(SubprocesoTecnica.id_subproceso == subproceso.id_subproceso)).all()
                    tecnicas_data = []
                    for st in sts:
                        tecnica = session.get(Tecnica, st.id_tecnica)
                        if tecnica:
                            tecnicas_data.append({"id_tecnica": tecnica.id_tecnica, "nombre": tecnica.nombre})
                    subprocesos_data.append({"id": subproceso.id_subproceso, "nombre": subproceso.nombre, "descripcion": subproceso.descripcion, "tecnicas": tecnicas_data})
                procesos_data.append({"id": proceso.id_proceso, "nombre": proceso.nombre, "descripcion": proceso.descripcion,
                                      "area": proceso.area_responsable, "responsableId": proceso.id_responsable, "subprocesos": subprocesos_data})
            return jsonify(procesos_data), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@procesos_bp.route('/subprocesos/crear', methods=['POST'])
def crear_subproceso():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        id_proceso = data.get("id_proceso")
        id_stakeholder = data.get("id_stakeholder")
        nombre = data.get("nombre")

        if not id_proceso or not nombre:
            return jsonify({"error": "id_proceso y nombre son requeridos"}), 400
        if not id_stakeholder:
            return jsonify({"error": "id_stakeholder es requerido"}), 400

        with Session(engine) as session:
            subproceso = Subproceso(
                id_proceso=id_proceso, id_stakeholder=id_stakeholder, nombre=nombre,
                descripcion=data.get("descripcion"),
                duracion_estimada_minutos=data.get("duracion_estimada_minutos"),
                estado='activo'
            )
            session.add(subproceso)
            session.commit()
            session.refresh(subproceso)
            return jsonify({"mensaje": "Subproceso creado correctamente", "id_subproceso": subproceso.id_subproceso, "nombre": subproceso.nombre}), 201

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


@procesos_bp.route('/subprocesos/asignar-tecnicas', methods=['POST'])
def asignar_tecnicas():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        id_subproceso = data.get("id_subproceso")
        nombres_tecnicas = data.get("tecnicas", [])

        if not id_subproceso:
            return jsonify({"error": "id_subproceso es requerido"}), 400
        if not nombres_tecnicas:
            return jsonify({"error": "Debe proporcionar al menos una técnica"}), 400

        with Session(engine) as session:
            subproceso = session.get(Subproceso, id_subproceso)
            if not subproceso:
                return jsonify({"error": "Subproceso no encontrado"}), 404

            session.query(SubprocesoTecnica).filter(SubprocesoTecnica.id_subproceso == id_subproceso).delete()

            tecnicas_asignadas = []
            for nombre_tecnica in nombres_tecnicas:
                tecnica = session.scalars(select(Tecnica).where(Tecnica.nombre == nombre_tecnica)).first()
                if not tecnica:
                    tecnica = Tecnica(nombre=nombre_tecnica)
                    session.add(tecnica)
                    session.commit()
                    session.refresh(tecnica)
                session.add(SubprocesoTecnica(id_subproceso=id_subproceso, id_tecnica=tecnica.id_tecnica))
                tecnicas_asignadas.append({"id_tecnica": tecnica.id_tecnica, "nombre": tecnica.nombre})

            session.commit()
            return jsonify({"mensaje": "Técnicas asignadas correctamente", "id_subproceso": id_subproceso, "tecnicas": tecnicas_asignadas}), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500