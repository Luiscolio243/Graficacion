from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from sqlalchemy import select, text
from sqlalchemy.exc import SQLAlchemyError
import string
import secrets
from datetime import datetime 

from db import engine

from Models.tech_leaders import TechLeader

equipo_ti_bp = Blueprint("equipo_ti", __name__) #creacion de modulo

#Genera una contra aleatoria usando letras y digitos
def _generar_password_temporal(longitud: int = 10) -> str:
    alfabeto = string.ascii_letters + string.digits #construye contra con letras y numeros
    return "".join(secrets.choice(alfabeto) for _ in range(longitud)) #hace string aleatorio usando secrets


#Ruta para obtener personas del equipo TI
@equipo_ti_bp.route('/ti/<int:id_proyecto>', methods=['GET'])
def obtener_equipo_ti(id_proyecto):
    try:
        #conexion a la bd
        with engine.connect() as conn:
            #consulta a la bd para que me de a las personas
            query = text(""" 
                SELECT
                    pti.id_personal_ti,
                    pti.id_proyecto,
                    pti.id_tech_leader,
                    pti.activo,
                    pti.fecha_asignacion,
                    pti.id_rol,
                    r.nombre AS rol_nombre,
                    u.id_usuario,
                    u.nombre AS usuario_nombre,
                    u.apellido AS usuario_apellido,
                    u.email AS usuario_email
                FROM personal_ti pti
                JOIN usuarios u ON u.id_usuario = pti.id_usuario
                JOIN roles r ON r.id_rol = pti.id_rol
                WHERE pti.id_proyecto = :id_proyecto
                ORDER BY pti.id_personal_ti DESC
            """)
            #ejecuta la consulta y me da los datos
            rows = conn.execute(query, {"id_proyecto": id_proyecto}).mappings().all()

        #me da los datos en JSON
        return jsonify([
            {
                #mapea los datos de cada fila 
                "id_personal_ti": row["id_personal_ti"],
                "id_proyecto": row["id_proyecto"],
                "id_tech_leader": row["id_tech_leader"],
                "activo": row["activo"],
                "fecha_asignacion": row["fecha_asignacion"].isoformat() if row["fecha_asignacion"] else None,
                "rol": {
                    "id_rol": row["id_rol"],
                    "nombre": row["rol_nombre"],
                },
                "usuario": {
                    "id_usuario": row["id_usuario"],
                    "nombre": row["usuario_nombre"],
                    "apellido": row["usuario_apellido"],
                    "email": row["usuario_email"],
                },
            }
            for row in rows
        ]), 200

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500 #da el error si es que hay uno



#ruta para crear un nuevo integrante al equipo de TI
#si el integrante ya tiene usario lo liga pero si no le crea un usuario 
@equipo_ti_bp.route('/ti/<int:id_proyecto>/crear', methods=['POST'])
def crear_integrante_ti(id_proyecto):
    try:
        #obtiene los datos enviados para la bd 
        data = request.get_json() or {}

        #extrae los campos
        nombre = (data.get("nombre") or "").strip() #elimina espacios en blanco 
        apellido = (data.get("apellido") or "").strip()
        email = (data.get("email") or data.get("correo") or "").strip().lower() #hace todo el email en minuscula
        id_rol = data.get("id_rol")
        rol_nombre = (data.get("rol_nombre") or data.get("rol") or "").strip()

        #si falta el nombre, apellido o email da error 
        if not nombre or not apellido or not email:
            return jsonify({"error": "nombre, apellido y email son requeridos"}), 400

        with engine.begin() as conn:
            # obtiene el tech lider del proyecto.
            tl = conn.execute(
                text("""SELECT id_tech_leader FROM tech_leaders WHERE id_proyecto = :id_proyecto LIMIT 1"""),
                {"id_proyecto": id_proyecto},
            ).fetchone()
            if tl is None:
                return jsonify({"error": "El proyecto no tiene Tech Leader asignado"}), 400
            id_tech_leader = tl[0]

            # resolver rol (id_rol) por id o por nombre
            if not id_rol and rol_nombre:
                #si no paso el id_rol pero si el rol_nombre se busca el id_rol
                r = conn.execute(
                    text("SELECT id_rol FROM roles WHERE nombre = :nombre LIMIT 1"),
                    {"nombre": rol_nombre},
                ).fetchone()
                if r is None:
                    # crea el rol si no existe
                    r = conn.execute(
                        text("""INSERT INTO roles (nombre, descripcion) VALUES (:nombre, :descripcion) RETURNING id_rol"""),
                        {"nombre": rol_nombre, "descripcion": f"Rol creado desde módulo TI: {rol_nombre}"},
                    ).fetchone()
                id_rol = r[0]

            if not id_rol:
                return jsonify({"error": "id_rol (o rol_nombre) es requerido"}), 400

            # busca o crea usuario por email
            usuario = conn.execute(
                text("""SELECT id_usuario, nombre, apellido, email, id_rol FROM usuarios WHERE email = :email LIMIT 1"""),
                {"email": email},
            ).mappings().fetchone()

            password_temporal = None
            usuario_creado = False

            #si no existe el usuario se crea y se hace una contra temporal
            if usuario is None:
                password_temporal = _generar_password_temporal() #llama a funcion para la contra
                usuario_creado = True
                #se crea usuario en la bd
                usuario = conn.execute(
                    text("""
                        INSERT INTO usuarios (nombre, apellido, email, password_hash, id_rol, fecha_registro, activo)
                        VALUES (:nombre, :apellido, :email, :password_hash, :id_rol, :fecha_registro, TRUE)
                        RETURNING id_usuario, nombre, apellido, email, id_rol
                    """),
                    {
                        "nombre": nombre,
                        "apellido": apellido,
                        "email": email,
                        "password_hash": password_temporal,  
                        "id_rol": id_rol,
                        "fecha_registro": datetime.utcnow(),
                    },
                ).mappings().fetchone()

            id_usuario = usuario["id_usuario"]

            # se verifica que el usuario no este en el proyecto ya
            existente = conn.execute(
                text("""
                    SELECT id_personal_ti
                    FROM personal_ti
                    WHERE id_proyecto = :id_proyecto AND id_usuario = :id_usuario
                    LIMIT 1
                """),
                {"id_proyecto": id_proyecto, "id_usuario": id_usuario},
            ).fetchone()
            #si ya existe da el error que ya esta registrado
            if existente is not None:
                return jsonify({
                    "error": "Este usuario ya está registrado en el equipo de TI del proyecto",
                    "id_personal_ti": existente[0],
                }), 409

            # se inserta en personal ti
            pti = conn.execute(
                text("""
                    INSERT INTO personal_ti (
                        id_tech_leader, id_usuario, nombre, correo, activo, fecha_asignacion, id_proyecto, id_rol
                    ) VALUES (
                        :id_tech_leader, :id_usuario, :nombre, :correo, TRUE, :fecha_asignacion, :id_proyecto, :id_rol
                    )
                    RETURNING id_personal_ti
                """),
                {
                    "id_tech_leader": id_tech_leader,
                    "id_usuario": id_usuario,
                    "nombre": f"{nombre} {apellido}".strip(),
                    "correo": email,
                    "fecha_asignacion": datetime.utcnow(),
                    "id_proyecto": id_proyecto,
                    "id_rol": id_rol,
                },
            ).fetchone()

            # se asegura que la relacion entre el usuario y el proyecto quede registrada en usuario-proyecto
            conn.execute(
                text("""
                    INSERT INTO proyecto_usuarios (id_proyecto, id_usuario, rol_en_proyecto, fecha_asignacion)
                    VALUES (:id_proyecto, :id_usuario, :rol_en_proyecto, :fecha_asignacion)
                    ON CONFLICT (id_proyecto, id_usuario) DO NOTHING
                """),
                {
                    "id_proyecto": id_proyecto,
                    "id_usuario": id_usuario,
                    "rol_en_proyecto": "ti",
                    "fecha_asignacion": datetime.utcnow(),
                },
            )

            # obtener nombre del rol para respuesta
            rol_row = conn.execute(
                text("SELECT id_rol, nombre FROM roles WHERE id_rol = :id_rol"),
                {"id_rol": id_rol},
            ).mappings().fetchone()

        #se notifica el nuevo integrante de ti, el rol y el usuario si este fue creado
        return jsonify({
            "mensaje": "Integrante TI creado correctamente",
            "personal_ti": {
                "id_personal_ti": pti[0],
                "id_proyecto": id_proyecto,
                "id_tech_leader": id_tech_leader,
                "activo": True,
                "fecha_asignacion": datetime.utcnow().isoformat(),
                "rol": {
                    "id_rol": rol_row["id_rol"] if rol_row else id_rol,
                    "nombre": rol_row["nombre"] if rol_row else rol_nombre,
                },
                "usuario": {
                    "id_usuario": usuario["id_usuario"],
                    "nombre": usuario["nombre"],
                    "apellido": usuario["apellido"],
                    "email": usuario["email"],
                }
            },
            "usuario_creado": usuario_creado,
            "password_temporal": password_temporal,
        }), 201
    #si hay error en la bd se muestra
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

#Edita los datos de un integrante de ti 
@equipo_ti_bp.route('/ti/editar/<int:id_personal_ti>', methods=['PUT'])
def editar_integrante_ti(id_personal_ti):
    try:
        #obtiene la peticion en JSON
        data = request.get_json() or {}

        #extraee y limpia los campos
        nombre = (data.get("nombre") or "").strip()
        apellido = (data.get("apellido") or "").strip()
        email = (data.get("email") or data.get("correo") or "").strip().lower()
        id_rol = data.get("id_rol")

        with engine.begin() as conn:
            # obtiene el registro actual
            actual = conn.execute(
                text("""
                    SELECT pti.id_personal_ti, pti.id_usuario, pti.id_proyecto
                    FROM personal_ti pti
                    WHERE pti.id_personal_ti = :id_personal_ti
                    LIMIT 1
                """),
                {"id_personal_ti": id_personal_ti},
            ).mappings().fetchone()
            #si no hay registro da error 
            if actual is None:
                return jsonify({"error": "Integrante TI no encontrado"}), 404

            id_usuario = actual["id_usuario"]

            #si no mando rol se queda con el que ya estaba
            if not id_rol:
                r = conn.execute(
                    text("""SELECT id_rol FROM personal_ti WHERE id_personal_ti = :id_personal_ti"""),
                    {"id_personal_ti": id_personal_ti},
                ).fetchone()
                id_rol = r[0] if r else None

            #si no encuentra el rol da error
            if not id_rol:
                return jsonify({"error": "id_rol es requerido"}), 400

            # actualizar usuario (si vienen datos)
            if nombre or apellido or email:
                if not (nombre and apellido and email):
                    # si manda uno pedimos los 3 mejor 
                    return jsonify({"error": "nombre, apellido y email son requeridos para editar"}), 400

                #actualiza nombre, apellido y email en la tabla de usuarios
                conn.execute(
                    text("""
                        UPDATE usuarios
                        SET nombre = :nombre, apellido = :apellido, email = :email
                        WHERE id_usuario = :id_usuario
                    """),
                    {
                        "nombre": nombre,
                        "apellido": apellido,
                        "email": email,
                        "id_usuario": id_usuario,
                    },
                )

                #actualiza el nombre y correo en la tabla personal_ti
                conn.execute(
                    text("""
                        UPDATE personal_ti
                        SET nombre = :nombre_completo, correo = :correo
                        WHERE id_personal_ti = :id_personal_ti
                    """),
                    {
                        "nombre_completo": f"{nombre} {apellido}".strip(),
                        "correo": email,
                        "id_personal_ti": id_personal_ti,
                    },
                )

            # actualizar rol del personal_ti
            conn.execute(
                text("""
                    UPDATE personal_ti
                    SET id_rol = :id_rol
                    WHERE id_personal_ti = :id_personal_ti
                """),
                {"id_rol": id_rol, "id_personal_ti": id_personal_ti},
            )

            #se consulta el registro actualizado para dar respuesta
            row = conn.execute(
                text("""
                    SELECT
                        pti.id_personal_ti,
                        pti.id_proyecto,
                        pti.id_tech_leader,
                        pti.activo,
                        pti.fecha_asignacion,
                        pti.id_rol,
                        r.nombre AS rol_nombre,
                        u.id_usuario,
                        u.nombre AS usuario_nombre,
                        u.apellido AS usuario_apellido,
                        u.email AS usuario_email
                    FROM personal_ti pti
                    JOIN usuarios u ON u.id_usuario = pti.id_usuario
                    JOIN roles r ON r.id_rol = pti.id_rol
                    WHERE pti.id_personal_ti = :id_personal_ti
                    LIMIT 1
                """),
                {"id_personal_ti": id_personal_ti},
            ).mappings().fetchone()

        #da los datos actualizado del integrante 
        return jsonify({
            "mensaje": "Integrante TI actualizado correctamente",
            "personal_ti": {
                "id_personal_ti": row["id_personal_ti"],
                "id_proyecto": row["id_proyecto"],
                "id_tech_leader": row["id_tech_leader"],
                "activo": row["activo"],
                "fecha_asignacion": row["fecha_asignacion"].isoformat() if row["fecha_asignacion"] else None,
                "rol": {
                    "id_rol": row["id_rol"],
                    "nombre": row["rol_nombre"],
                },
                "usuario": {
                    "id_usuario": row["id_usuario"],
                    "nombre": row["usuario_nombre"],
                    "apellido": row["usuario_apellido"],
                    "email": row["usuario_email"],
                },
            }
        }), 200
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500