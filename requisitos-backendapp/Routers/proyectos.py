from flask import Blueprint, request, jsonify
from sqlalchemy import text, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from datetime import datetime
import secrets
import string

from db import engine
from Models.Proyectos import Proyecto
from Models.ProductOwner import ProductOwner
from Models.tech_leaders import TechLeader

proyectos_bp = Blueprint("proyectos", __name__)


def _generar_password_temporal(longitud: int = 10) -> str:
    alfabeto = string.ascii_letters + string.digits #construye contra con letras y numeros
    return "".join(secrets.choice(alfabeto) for _ in range(longitud)) #hace string aleatorio usando secrets


def _obtener_o_crear_usuario_po(conn, correo, nombre, apellido):
    """Busca usuario por email. Si no existe, lo crea. Retorna id_usuario o None si no hay correo."""
    if not correo or not (correo or "").strip():
        return None
    correo = str(correo).strip().lower()
    nombre = (nombre or "").strip() or "Sin nombre"
    apellido = (apellido or "").strip() or "Sin apellido"

    u = conn.execute(
        text("""SELECT id_usuario FROM usuarios WHERE email = :email LIMIT 1"""),
        {"email": correo},
    ).fetchone()
    if u is not None:
        return u[0]

    r = conn.execute(
        text("""SELECT id_rol FROM roles WHERE nombre IN ('Product Owner', 'colaborador') LIMIT 1"""),
    ).fetchone()
    if r is None:
        r = conn.execute(
            text("""INSERT INTO roles (nombre, descripcion) VALUES ('colaborador', 'Rol por defecto') RETURNING id_rol"""),
        ).fetchone()
    id_rol = r[0]

    pass_temp = _generar_password_temporal()
    nuevo = conn.execute(
        text("""
            INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, fecha_registro, activo)
            VALUES (:nombre, :apellido, :email, :password_hash, :id_rol, :fecha_registro, TRUE)
            RETURNING id_usuario
        """),
        {
            "nombre": nombre,
            "apellido": apellido,
            "email": correo,
            "password_hash": pass_temp,
            "id_rol": id_rol,
            "fecha_registro": datetime.utcnow(),
        },
    ).fetchone()
    return nuevo[0]


@proyectos_bp.route('/proyectos/crear', methods=['POST'])
def crear_proyecto():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        organizacion = data.get("organizacion")
        fecha_inicio = data.get("fechaInicio")
        id_creador = data.get("id_usuario") or 1

        po = data.get("productOwner") or {}
        nombre_po = (po.get("nombre") or "").strip()
        apellidos_po = (po.get("apellidos") or "").strip()
        correo_po = po.get("email")
        telefono_po = po.get("telefono")

        tl = data.get("liderTecnico") or {}
        nombre_tl = (tl.get("nombre") or "").strip()
        apellidos_tl = (tl.get("apellidos") or "").strip()
        correo_tl = tl.get("email")
        telefono_tl = tl.get("telefono")

        with engine.begin() as conn:
            id_usuario_po = _obtener_o_crear_usuario_po(conn, correo_po, nombre_po, apellidos_po)
            id_usuario_tl = _obtener_o_crear_usuario_po(conn, correo_tl, nombre_tl, apellidos_tl)

            proyecto = conn.execute(
                text("""
                    INSERT INTO proyectos (nombre, descripcion, objetivo_general, fecha_inicio, organizacion, estado, id_creador, fecha_creacion, fecha_actualizacion)
                    VALUES (:nombre, :descripcion, :objetivo, :fecha_inicio, :organizacion, 'En progreso', :id_creador, :ahora, :ahora)
                    RETURNING id_proyecto
                """),
                {
                    "nombre": nombre,
                    "descripcion": descripcion or None,
                    "objetivo": objetivo or None,
                    "fecha_inicio": datetime.strptime(fecha_inicio, "%Y-%m-%d").date() if fecha_inicio else None,
                    "organizacion": organizacion or None,
                    "id_creador": id_creador,
                    "ahora": datetime.utcnow(),
                },
            ).fetchone()
            id_proyecto = proyecto[0]

            nombre_completo_po = " ".join(filter(None, [nombre_po, apellidos_po])) or None
            conn.execute(
                text("""
                    INSERT INTO product_owners (id_proyecto, id_usuario, nombre, correo, telefono, activo)
                    VALUES (:id_proyecto, :id_usuario, :nombre, :correo, :telefono, TRUE)
                """),
                {
                    "id_proyecto": id_proyecto,
                    "id_usuario": id_usuario_po,
                    "nombre": nombre_completo_po,
                    "correo": correo_po,
                    "telefono": telefono_po,
                },
            )

            nombre_completo_tl = " ".join(filter(None, [nombre_tl, apellidos_tl])) or None
            conn.execute(
                text("""
                    INSERT INTO tech_leaders (id_proyecto, id_usuario, nombre, correo, telefono, activo)
                    VALUES (:id_proyecto, :id_usuario, :nombre, :correo, :telefono, TRUE)
                """),
                {
                    "id_proyecto": id_proyecto,
                    "id_usuario": id_usuario_tl,
                    "nombre": nombre_completo_tl,
                    "correo": correo_tl,
                    "telefono": telefono_tl,
                },
            )

        return jsonify({
            "mensaje": "Proyecto creado correctamente",
            "id": id_proyecto
        }), 201
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@proyectos_bp.route('/proyectos/obtener', methods=['GET'])
def obtener_proyetos():
    with Session(engine) as session:
        proyectos = session.scalars(select(Proyecto)).all()
        return[
        {
            "id_proyecto": p.id_proyecto,
            "nombre": p.nombre,
            "estado": p.estado,
            "descripcion": p.descripcion
        }
        for p in proyectos
    ], 200


@proyectos_bp.route('/proyectos/<int:id_proyecto>', methods=['GET'])
def obtener_proyecto(id_proyecto):
    with Session(engine) as session:
        proyecto = session.get(Proyecto, id_proyecto)

        if not proyecto:
            return {"error": "No se encontro del proyecto"}, 404

        return {
            "id_proyecto": proyecto.id_proyecto,
            "nombre": proyecto.nombre,
            "estado": proyecto.estado,
            "descripcion": proyecto.descripcion,
            "fecha_inicio": proyecto.fecha_inicio.isoformat() if proyecto.fecha_inicio else None,
            "organizacion": proyecto.organizacion
        }, 200


@proyectos_bp.route('/productowner/<int:id_proyecto>', methods=['GET'])
def obtener_product_owner_proyecto(id_proyecto):
    with Session(engine) as session:
        product_owner = session.query(ProductOwner).filter(ProductOwner.id_proyecto == id_proyecto).first()

        if product_owner is None:
            return jsonify({"mensaje: ": "No se encontro un product owner en este proyecto"})

        return jsonify({
            "id": product_owner.id_product_owner,
            "nombre": product_owner.nombre,
            "id_proyecto": product_owner.id_proyecto,
            "correo": product_owner.correo,
            "telefono": product_owner.telefono
        })


@proyectos_bp.route('/tech_leaders/<int:id_proyecto>', methods=['GET'])
def obtener_techleader_proyecto(id_proyecto):
    with Session(engine) as session:
        tech_leader = session.query(TechLeader).filter(TechLeader.id_proyecto == id_proyecto).first()

        if tech_leader is None:
            return jsonify({"mensaje: ": "No se encontro un tech leader en este proyecto"})

        return jsonify({
            "id": tech_leader.id_tech_leader,
            "nombre": tech_leader.nombre,
            "id_proyecto": tech_leader.id_proyecto,
            "correo": tech_leader.correo,
            "telefono": tech_leader.telefono
        })


@proyectos_bp.route('/proyectos/<int:id_proyecto>', methods=['PUT'])
def editar_proyecto(id_proyecto):
    try:
        data = request.get_json() or {}

        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        organizacion = data.get("organizacion")
        fecha_inicio = data.get("fechaInicio") or data.get("fecha_inicio")
        estado = data.get("estado")

        po = data.get("productOwner") or {}
        tl = data.get("liderTecnico") or data.get("techLeader") or {}

        with engine.begin() as conn:
            # proyecto
            p = conn.execute(
                text("""SELECT id_proyecto FROM proyectos WHERE id_proyecto = :id_proyecto LIMIT 1"""),
                {"id_proyecto": id_proyecto},
            ).fetchone()
            if p is None:
                return jsonify({"error": "Proyecto no encontrado"}), 404

            if nombre is not None and not str(nombre).strip():
                return jsonify({"error": "nombre es requerido"}), 400

            conn.execute(
                text("""
                    UPDATE proyectos
                    SET
                        nombre = COALESCE(:nombre, nombre),
                        descripcion = COALESCE(:descripcion, descripcion),
                        objetivo_general = COALESCE(:objetivo, objetivo_general),
                        organizacion = COALESCE(:organizacion, organizacion),
                        fecha_inicio = COALESCE(:fecha_inicio, fecha_inicio),
                        estado = COALESCE(:estado, estado),
                        fecha_actualizacion = :ahora
                    WHERE id_proyecto = :id_proyecto
                """),
                {
                    "id_proyecto": id_proyecto,
                    "nombre": str(nombre).strip() if nombre is not None else None,
                    "descripcion": (descripcion or None) if descripcion is not None else None,
                    "objetivo": (objetivo or None) if objetivo is not None else None,
                    "organizacion": (organizacion or None) if organizacion is not None else None,
                    "fecha_inicio": datetime.strptime(fecha_inicio, "%Y-%m-%d").date() if fecha_inicio else None,
                    "estado": (estado or None) if estado is not None else None,
                    "ahora": datetime.utcnow(),
                },
            )

            # PO
            if po:
                po_nombre = (po.get("nombre") or "").strip()
                po_apellidos = (po.get("apellidos") or "").strip()
                po_correo = (po.get("email") or po.get("correo") or "").strip()
                po_telefono = (po.get("telefono") or "").strip()

                nombre_completo_po = " ".join(filter(None, [po_nombre, po_apellidos])) or None
                conn.execute(
                    text("""
                        UPDATE product_owners
                        SET nombre = :nombre, correo = :correo, telefono = :telefono
                        WHERE id_proyecto = :id_proyecto
                    """),
                    {
                        "id_proyecto": id_proyecto,
                        "nombre": nombre_completo_po,
                        "correo": po_correo or None,
                        "telefono": po_telefono or None,
                    },
                )

            # TL
            if tl:
                tl_nombre = (tl.get("nombre") or "").strip()
                tl_apellidos = (tl.get("apellidos") or "").strip()
                tl_correo = (tl.get("email") or tl.get("correo") or "").strip()
                tl_telefono = (tl.get("telefono") or "").strip()

                nombre_completo_tl = " ".join(filter(None, [tl_nombre, tl_apellidos])) or None
                conn.execute(
                    text("""
                        UPDATE tech_leaders
                        SET nombre = :nombre, correo = :correo, telefono = :telefono
                        WHERE id_proyecto = :id_proyecto
                    """),
                    {
                        "id_proyecto": id_proyecto,
                        "nombre": nombre_completo_tl,
                        "correo": tl_correo or None,
                        "telefono": tl_telefono or None,
                    },
                )

            actualizado = conn.execute(
                text("""
                    SELECT id_proyecto, nombre, estado, descripcion, fecha_inicio, organizacion
                    FROM proyectos
                    WHERE id_proyecto = :id_proyecto
                    LIMIT 1
                """),
                {"id_proyecto": id_proyecto},
            ).mappings().fetchone()

        return jsonify({
            "mensaje": "Proyecto actualizado correctamente",
            "proyecto": {
                "id_proyecto": actualizado["id_proyecto"],
                "nombre": actualizado["nombre"],
                "estado": actualizado["estado"],
                "descripcion": actualizado["descripcion"],
                "fecha_inicio": actualizado["fecha_inicio"].isoformat() if actualizado["fecha_inicio"] else None,
                "organizacion": actualizado["organizacion"],
            }
        }), 200
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500