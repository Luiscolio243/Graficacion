from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

from db import engine

from Models.Proceso import Proceso
from Models.Subproceso import Subproceso
from Models.Tecnica import Tecnica
from Models.SubprocesoTecnica import SubprocesoTecnica

procesos_bp = Blueprint("procesos", __name__)

#ruta que crea un nuevo proceso
@procesos_bp.route('/procesos/crear', methods=['POST'])
def crear_proceso():
    try:
        data = request.get_json()

        #valida que los campos no esten vacios
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        #extrae los datos 
        id_proyecto = data.get("id_proyecto")
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        area_responsable = data.get("area")
        id_responsable = data.get("responsableId")

        #valida que tengo el id del proyecto y el nombre del proceso
        if not id_proyecto or not nombre:
            return jsonify({"error": "id_proyecto y nombre son requeridos"}), 400

        with engine.begin() as conn:
            #inserta el proceso en la bd 
            resultado = conn.execute(
                text("""
                    INSERT INTO procesos (id_proyecto, nombre, descripcion, objetivo, area_responsable, id_responsable, estado, fecha_creacion)
                    VALUES (:id_proyecto, :nombre, :descripcion, :objetivo, :area_responsable, :id_responsable, 'activo', :fecha_creacion)
                    RETURNING id_proceso, nombre
                """),
                {
                    "id_proyecto": id_proyecto,
                    "nombre": nombre,
                    "descripcion": descripcion or None,
                    "objetivo": objetivo or None,
                    "area_responsable": area_responsable or None,
                    "id_responsable": id_responsable or None,
                    "fecha_creacion": datetime.utcnow(),
                }
            ).fetchone()

            return jsonify({
                "mensaje": "Proceso creado correctamente",
                "id_proceso": resultado[0],
                "nombre": resultado[1]
            }), 201

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

#edita un proceso
@procesos_bp.route('/procesos/<int:id_proceso>', methods=['PUT'])
def editar_proceso(id_proceso):
    try:
        data = request.get_json() or {}

        #extrae los campos que se actualizaran 
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        area_responsable = data.get("area")
        id_responsable = data.get("responsableId")

        if nombre is not None and not str(nombre).strip():
            return jsonify({"error": "nombre es requerido"}), 400

        #si no hay nombre da error 
        with Session(engine) as session:
            proceso = session.get(Proceso, id_proceso)
            if not proceso:
                return jsonify({"error": "Proceso no encontrado"}), 404

            #solo se actualizan los campos que se modificaron 
            if nombre is not None:
                proceso.nombre = str(nombre).strip()
            if descripcion is not None:
                proceso.descripcion = descripcion or None
            if objetivo is not None:
                proceso.objetivo = objetivo or None
            if area_responsable is not None:
                proceso.area_responsable = area_responsable or None
            if "responsableId" in data:
                proceso.id_responsable = id_responsable or None

            #guarda los campos y actualiza los datos de la tabla en la bd
            session.commit()
            session.refresh(proceso)

            return jsonify({
                "mensaje": "Proceso actualizado correctamente",
                "proceso": {
                    "id": proceso.id_proceso,
                    "nombre": proceso.nombre,
                    "descripcion": proceso.descripcion,
                    "area": proceso.area_responsable,
                    "responsableId": proceso.id_responsable,
                }
            }), 200
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@procesos_bp.route('/procesos/<int:id_proyecto>', methods=['GET'])
def obtener_procesos(id_proyecto):
    # Obtiene procesos con sus subprocesos y técnicas
    try:
        with Session(engine) as session:
            procesos = session.scalars(
                select(Proceso).where(Proceso.id_proyecto == id_proyecto)
            ).all()

            procesos_data = []
            for proceso in procesos:
                subprocesos = session.scalars(
                    select(Subproceso).where(Subproceso.id_proceso == proceso.id_proceso)
                ).all()

                subprocesos_data = []
                for subproceso in subprocesos:
                    subproceso_tecnicas = session.scalars(
                        select(SubprocesoTecnica).where(
                            SubprocesoTecnica.id_subproceso == subproceso.id_subproceso
                        )
                    ).all()

                    tecnicas_data = []
                    for st in subproceso_tecnicas:
                        tecnica = session.get(Tecnica, st.id_tecnica)
                        if tecnica:
                            tecnicas_data.append({
                                "id_tecnica": tecnica.id_tecnica,
                                "nombre": tecnica.nombre
                            })

                    subprocesos_data.append({
                        "id_subproceso": subproceso.id_subproceso,
                        "nombre": subproceso.nombre,
                        "descripcion": subproceso.descripcion,
                        "tecnicas": tecnicas_data
                    })

                procesos_data.append({
                    "id_proceso": proceso.id_proceso,
                    "nombre": proceso.nombre,
                    "descripcion": proceso.descripcion,
                    "area": proceso.area_responsable,
                    "responsableId": proceso.id_responsable,
                    "subprocesos": subprocesos_data
                })

            return jsonify(procesos_data), 200

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500



@procesos_bp.route('/subprocesos/crear', methods=['POST'])
def crear_subproceso():
    # Crea un subproceso asociado a un proceso principal
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        id_proceso = data.get("id_proceso")
        id_stakeholder = data.get("id_stakeholder")
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        duracion_estimada_minutos = data.get("duracion_estimada_minutos")

        if not id_proceso or not nombre:
            return jsonify({"error": "id_proceso y nombre son requeridos"}), 400

        if not id_stakeholder:
            return jsonify({"error": "id_stakeholder es requerido"}), 400

        with Session(engine) as session:
            subproceso = Subproceso(
                id_proceso=id_proceso,
                id_stakeholder=id_stakeholder,
                nombre=nombre,
                descripcion=descripcion,
                duracion_estimada_minutos=duracion_estimada_minutos,
                estado='activo'
            )

            session.add(subproceso)
            session.commit()
            session.refresh(subproceso)

            return jsonify({
                "mensaje": "Subproceso creado correctamente",
                "id_subproceso": subproceso.id_subproceso,
                "nombre": subproceso.nombre
            }), 201

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@procesos_bp.route('/subprocesos/<int:id_subproceso>', methods=['PUT'])
def editar_subproceso(id_subproceso):
    try:
        data = request.get_json() or {}

        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        id_stakeholder = data.get("id_stakeholder")
        duracion_estimada_minutos = data.get("duracion_estimada_minutos")

        if nombre is not None and not str(nombre).strip():
            return jsonify({"error": "nombre es requerido"}), 400

        with Session(engine) as session:
            subproceso = session.get(Subproceso, id_subproceso)
            if not subproceso:
                return jsonify({"error": "Subproceso no encontrado"}), 404

            if nombre is not None:
                subproceso.nombre = str(nombre).strip()
            if descripcion is not None:
                subproceso.descripcion = descripcion or None
            if "id_stakeholder" in data:
                subproceso.id_stakeholder = id_stakeholder
            if "duracion_estimada_minutos" in data:
                subproceso.duracion_estimada_minutos = duracion_estimada_minutos

            session.commit()
            session.refresh(subproceso)

            return jsonify({
                "mensaje": "Subproceso actualizado correctamente",
                "subproceso": {
                    "id": subproceso.id_subproceso,
                    "nombre": subproceso.nombre,
                    "descripcion": subproceso.descripcion,
                    "id_stakeholder": subproceso.id_stakeholder,
                }
            }), 200
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@procesos_bp.route('/subprocesos/asignar-tecnicas', methods=['POST'])
def asignar_tecnicas():
    # Asigna técnicas a un subproceso (reemplaza las anteriores)
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        id_subproceso = data.get("id_subproceso")
        nombres_tecnicas = data.get("tecnicas", [])

        if not id_subproceso:
            return jsonify({"error": "id_subproceso es requerido"}), 400

        if not nombres_tecnicas or len(nombres_tecnicas) == 0:
            return jsonify({"error": "Debe proporcionar al menos una técnica"}), 400

        with Session(engine) as session:
            subproceso = session.get(Subproceso, id_subproceso)
            if not subproceso:
                return jsonify({"error": "Subproceso no encontrado"}), 404

            # Eliminar técnicas anteriores
            session.query(SubprocesoTecnica).filter(
                SubprocesoTecnica.id_subproceso == id_subproceso
            ).delete()

            # Crear o obtener técnicas y asignarlas
            tecnicas_asignadas = []
            for nombre_tecnica in nombres_tecnicas:
                tecnica = session.scalars(
                    select(Tecnica).where(Tecnica.nombre == nombre_tecnica)
                ).first()

                # Crear técnica si no existe
                if not tecnica:
                    tecnica = Tecnica(nombre=nombre_tecnica)
                    session.add(tecnica)
                    session.commit()
                    session.refresh(tecnica)

                # Crear relación
                subproceso_tecnica = SubprocesoTecnica(
                    id_subproceso=id_subproceso,
                    id_tecnica=tecnica.id_tecnica
                )
                session.add(subproceso_tecnica)
                tecnicas_asignadas.append({
                    "id_tecnica": tecnica.id_tecnica,
                    "nombre": tecnica.nombre
                })

            session.commit()

            return jsonify({
                "mensaje": "Técnicas asignadas correctamente",
                "id_subproceso": id_subproceso,
                "tecnicas": tecnicas_asignadas
            }), 200

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500