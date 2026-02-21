from itertools import product
from flask_cors import cross_origin, CORS
from sqlalchemy import create_engine,text, select #importamos clase create engine del ORM sqlAlchemy
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from flask import Flask,request, jsonify
import jwt
from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException
from Models.Proyectos import Proyecto
from Models.ProductOwner import ProductOwner
from Models.Stakeholders import Stakeholders
from Models.tech_leaders import TechLeader
from Models.roles import Roles
from Models.Proceso import Proceso
from Models.Subproceso import Subproceso
from Models.Tecnica import Tecnica
from Models.SubprocesoTecnica import SubprocesoTecnica
from datetime import datetime
import secrets
import string


secret_key = "secret"

engine = create_engine('postgresql+psycopg2://postgres:18052004pau@localhost:5432/Graficacion')

app = Flask(__name__)

cors = CORS(app, resources={r"/*": {"origins": "*"}})

class LoginRequest(BaseModel):
    email: str
    password: str

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email y password requeridos"}), 400

        with engine.connect() as conn:
            query = text("""
                SELECT id_usuario, nombre, email, apellido
                FROM usuarios
                WHERE email = :email
                AND password_hash = :password
            """)

            result = conn.execute(
                query,
                {"email": email, "password": password}
            ).fetchone()

            if result is None:
                return jsonify({"error": "Email o password incorrectos"}), 401

            token = jwt.encode({'username': result.nombre}, secret_key, algorithm='HS256')

            return jsonify({
                "message": "Login exitoso",
                "user": {
                    "id": result.id_usuario,
                    "nombre": result.nombre,
                    "apellido": result.apellido,
                    "email": result.email
                },
                "token": token

            }), 200

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500





def verify_token(func):
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization', '')
        if not token:
            return jsonify({'message': 'Token not provided'}), 401
        token_parts = token.split(" ")
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({'message': 'Invalid token format'}), 401
        token = token_parts[1]
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            request.username = payload['username']
            return func(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 403
    return wrapper


@app.route('/proyectos/crear', methods=['POST'])
def crear_proyecto():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        organizacion = data.get("organizacion")

        nombre_po = data.get("nombre_po")
        apellidos_po = data.get("apellidos_po")
        correo_po = data.get("correo_po")
        telefono_po = data.get("telefono_po")

        nombre_tl = data.get("nombre_tl")
        apellidos_tl = data.get("apellidos_tl")
        correo_tl = data.get("correo_tl")
        telefono_tl = data.get("telefono_tl")

        id_usuario = data.get("id_usuario")

        with Session(engine) as session:
            proyecto = Proyecto(
                nombre= nombre,
                descripcion = descripcion,
                objetivo_general = objetivo,
                estado= "En progreso",
                id_creador=1

            )

            session.add(proyecto)
            session.commit()
            session.refresh(proyecto)

        with Session(engine) as session:
            product_owner = ProductOwner(
                id_proyecto= proyecto.id_proyecto,
                id_usuario= id_usuario,
                nombre= nombre_po,
                correo= correo_po
            )

        session.add(product_owner)
        session.commit()
        session.refresh(product_owner)

        with Session(engine) as session:
            tech_leader = TechLeader(
                id_proyecto= proyecto.id_proyecto,
                id_usuario= id_usuario,
                nombre= nombre_tl,
                correo= correo_tl
            )

        session.add(tech_leader)
        session.commit()
        session.refresh(tech_leader)

        return jsonify({
            "mensaje": "Proyecto creado correctamente",
            "id": proyecto.id_proyecto
        }), 201
    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500



@app.route('/proyectos/obtener', methods=['GET'])
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



@app.route('/proyectos/<int:id_proyecto>', methods=['GET'])
def obtener_proyecto(id_proyecto):
    with Session(engine) as session:
        proyecto = session.get(Proyecto, id_proyecto)

        if not proyecto:
            return {"error": "No se encontro del proyecto"}, 404

        return {
            "id_proyecto": proyecto.id_proyecto,
            "nombre": proyecto.nombre,
            "estado": proyecto.estado,
            "descripcion": proyecto.descripcion
        }, 200




@app.route('/productowner/<int:id_proyecto>', methods=['GET'])
def obtener_product_owner_proyecto(id_proyecto):
    with Session(engine) as session:
        product_owner = session.query(ProductOwner).filter(ProductOwner.id_proyecto == id_proyecto).first()

        if product_owner is None:
            return jsonify({"mensaje: ": "No se encontro un product owner en este proyecto"})

        return jsonify({
            "id": product_owner.id_product_owner,
            "nombre": product_owner.nombre,
            "id_proyecto": product_owner.id_proyecto,
            "correo": product_owner.correo
        })

@app.route('/tech_leaders/<int:id_proyecto>', methods=['GET'])
def obtener_techleader_proyecto(id_proyecto):
    with Session(engine) as session:
        tech_leader = session.query(TechLeader).filter(TechLeader.id_proyecto == id_proyecto).first()

        if tech_leader is None:
            return jsonify({"mensaje: ": "No se encontro un tech leader en este proyecto"})

        return jsonify({
            "id": tech_leader.id_tech_leader,
            "nombre": tech_leader.nombre,
            "id_proyecto": tech_leader.id_proyecto
        })

#ruta para crear rol
@app.route('/roles/agregar', methods=['POST'])
def agregar_roles():
    try:
        data = request.get_json() #obtiene json del front

        #si no esta bien el json da error
        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        #extrae los campos 
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")

        #valida si tiene el nombre porque pues es obligatorio
        if not nombre:
            return jsonify({"error": "Nombre requerido"}), 400

        #se abre la sesion del orm con la bd 
        with Session(engine) as session:
            #modelo de roles
            rol = Roles(
                nombre=nombre,
                descripcion=descripcion
            )

            session.add(rol) #agrega a la sesion
            session.commit() #hace el insert
            session.refresh(rol) #se refresca para obtener el id 

            #devuelve la respuesta que se creo
            return jsonify({
                "id": rol.id_rol,
                "nombre": rol.nombre,
                "descripcion": rol.descripcion
            }), 201

    #si hay error lo captura
    except Exception as e:
        print("ERROR REAL:", str(e))
        return jsonify({"error": "Error interno"}), 500

#Ruta para obtener los roles 
@app.route('/roles/obtener', methods=['GET', 'POST'])
def obtener_roles():
    # Pongo esta ruta por mientras porque devuelve todos los roles.
    with Session(engine) as session: #sesion de la orm 
        roles = session.scalars(select(Roles)).all() #select de los roles
        return jsonify([ #devuelve lista de los roles 
            {
                "id_rol": r.id_rol,
                "nombre": r.nombre,
                "descripcion": r.descripcion
            }
            for r in roles
        ]), 200


def _generar_password_temporal(longitud: int = 10) -> str:
    alfabeto = string.ascii_letters + string.digits #construye contra con letras y numeros
    return "".join(secrets.choice(alfabeto) for _ in range(longitud)) #hace string aleatorio usando secrets

#Ruta para obtener personas del equipo TI
@app.route('/ti/<int:id_proyecto>', methods=['GET'])
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
@app.route('/ti/<int:id_proyecto>/crear', methods=['POST'])
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




@app.route('/stakeholders/agregar', methods=['POST'])
def agregar_stakeholders(id_proyecto):

    data = request.get_json()

    nombre = data.get("nombre")
    descripcion = data.get("descripcion")

    with Session(engine) as session:
        roles = Roles(
            nombre= nombre,
            descripcion= descripcion
        )

    session.add(roles)
    session.commit()
    session.refresh(roles)


@app.route('/stakeholders/<int:id_proyecto>', methods=['GET'])
def obtener_stakeholders(id_proyecto):
    with Session(engine) as session:
        # Filtrar por id_proyecto
        stakeholders = session.scalars(
            select(Stakeholders).where(Stakeholders.id_proyecto == id_proyecto)
        ).all()

        return jsonify([
            {
                "id_stakeholder": s.id_stakeholder,
                "nombre": s.nombre,
                "rol": s.rol,
                "tipo": s.tipo,
                "email": s.email
            }
            for s in stakeholders
        ]), 200


@app.route('/procesos/crear', methods=['POST'])
def crear_proceso():
    # Registra un proceso principal en el sistema
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "JSON inválido"}), 400

        id_proyecto = data.get("id_proyecto")
        nombre = data.get("nombre")
        descripcion = data.get("descripcion")
        objetivo = data.get("objetivo")
        area_responsable = data.get("area")
        id_responsable = data.get("responsableId")

        if not id_proyecto or not nombre:
            return jsonify({"error": "id_proyecto y nombre son requeridos"}), 400

        with Session(engine) as session:
            proceso = Proceso(
                id_proyecto=id_proyecto,
                nombre=nombre,
                descripcion=descripcion,
                objetivo=objetivo,
                area_responsable=area_responsable,
                id_responsable=id_responsable,
                estado='activo'
            )

            session.add(proceso)
            session.commit()
            session.refresh(proceso)

            return jsonify({
                "mensaje": "Proceso creado correctamente",
                "id_proceso": proceso.id_proceso,
                "nombre": proceso.nombre
            }), 201

    except SQLAlchemyError as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/procesos/<int:id_proyecto>', methods=['GET'])
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
                        "id": subproceso.id_subproceso,
                        "nombre": subproceso.nombre,
                        "descripcion": subproceso.descripcion,
                        "tecnicas": tecnicas_data
                    })

                procesos_data.append({
                    "id": proceso.id_proceso,
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


@app.route('/subprocesos/crear', methods=['POST'])
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


@app.route('/subprocesos/asignar-tecnicas', methods=['POST'])
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


#funcion para correr la app en flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port= 5000, debug = True)