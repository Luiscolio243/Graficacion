from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session
from datetime import datetime

connection_url = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="Fernando2003",
    host="localhost",
    port=5432,
    database="Graficacion"
)

engine = create_engine(connection_url)

# Crear tablas si no existen
from Models.Base import Base
from Models.Seguimiento import Seguimiento
from Models.SeguimientoPaso import SeguimientoPaso
from Models.SeguimientoProblema import SeguimientoProblema
from Models.SeguimientoMetrica import SeguimientoMetrica

Base.metadata.create_all(engine, checkfirst=True)
print("OK: Tablas verificadas/creadas")

# Usar proyecto 16 que tiene procesos definidos
id_proyecto = 16
id_proceso = 3
id_subproceso = 3
nombre_proceso = "Gestion de Insumos"

print(f"OK: proyecto={id_proyecto}, proceso={id_proceso}, subproceso={id_subproceso}")

# Verificar si ya hay datos
with engine.connect() as conn:
    count = conn.execute(text(
        "SELECT COUNT(*) FROM seguimiento WHERE id_proyecto = :p"
    ), {"p": id_proyecto}).fetchone()[0]
    if count > 0:
        print(f"OK: Ya hay {count} seguimiento(s) para el proyecto {id_proyecto}, no se insertan duplicados")
        exit(0)

# Insertar datos de prueba
with Session(engine) as session:
    datos = [
        {
            "titulo": "Registro de pedido en tienda en línea",
            "nombre_proceso": nombre_proceso,
            "pasos": [
                {"nombre": "Usuario selecciona productos", "duracion_min": 5, "orden": 1},
                {"nombre": "Usuario completa datos de envío", "duracion_min": 3, "orden": 2},
                {"nombre": "Sistema procesa pago", "duracion_min": 2, "orden": 3},
                {"nombre": "Se genera confirmación de orden", "duracion_min": 1, "orden": 4},
            ],
            "problemas": [
                {"descripcion": "El formulario de envío no guarda la dirección previa del usuario"},
            ],
            "metricas": [
                {"nombre": "Tiempo total", "valor": "11 min"},
                {"nombre": "Tasa de abandono", "valor": "18%"},
                {"nombre": "Errores de validación", "valor": "2"},
            ],
        },
        {
            "titulo": "Proceso de devolución de producto",
            "nombre_proceso": nombre_proceso,
            "pasos": [
                {"nombre": "Cliente solicita devolución vía portal", "duracion_min": 4, "orden": 1},
                {"nombre": "Agente revisa elegibilidad del producto", "duracion_min": 10, "orden": 2},
                {"nombre": "Se aprueba o rechaza la solicitud", "duracion_min": 5, "orden": 3},
                {"nombre": "Logística coordina recolección", "duracion_min": 60, "orden": 4},
                {"nombre": "Reembolso emitido al cliente", "duracion_min": 1440, "orden": 5},
            ],
            "problemas": [
                {"descripcion": "El cliente no recibe notificación cuando la devolución es aprobada"},
                {"descripcion": "El tiempo de reembolso supera los 3 días prometidos en algunos bancos"},
            ],
            "metricas": [
                {"nombre": "Tiempo promedio de resolución", "valor": "2.3 días"},
                {"nombre": "Satisfacción del cliente", "valor": "72%"},
                {"nombre": "Devoluciones exitosas", "valor": "89%"},
            ],
        },
        {
            "titulo": "Alta de nuevo empleado en RRHH",
            "nombre_proceso": nombre_proceso,
            "pasos": [
                {"nombre": "RRHH crea expediente digital", "duracion_min": 15, "orden": 1},
                {"nombre": "Empleado firma contrato electrónico", "duracion_min": 10, "orden": 2},
                {"nombre": "TI asigna equipos y credenciales", "duracion_min": 30, "orden": 3},
                {"nombre": "Inducción a procesos internos", "duracion_min": 480, "orden": 4},
            ],
            "problemas": [],
            "metricas": [
                {"nombre": "Tiempo total de onboarding", "valor": "9.2 hrs"},
                {"nombre": "Costo por contratación", "valor": "$1,200 MXN"},
            ],
        },
    ]

    for i, d in enumerate(datos):
        seg = Seguimiento(
            id_proyecto=id_proyecto,
            id_proceso=id_proceso,
            id_subproceso=id_subproceso,
            id_responsable=None,
            titulo=d["titulo"],
            id_transaccion=f"TXN-{datetime.now().year}-{i+1:03d}",
            nombre_proceso=d["nombre_proceso"],
            fecha_creacion=datetime.now(),
        )
        session.add(seg)
        session.flush()

        for paso in d["pasos"]:
            session.add(SeguimientoPaso(
                id_seguimiento=seg.id_seguimiento,
                nombre=paso["nombre"],
                duracion_min=paso["duracion_min"],
                orden=paso["orden"],
            ))

        for prob in d["problemas"]:
            session.add(SeguimientoProblema(
                id_seguimiento=seg.id_seguimiento,
                descripcion=prob["descripcion"],
            ))

        for met in d["metricas"]:
            session.add(SeguimientoMetrica(
                id_seguimiento=seg.id_seguimiento,
                nombre=met["nombre"],
                valor=met["valor"],
            ))

    session.commit()
    print(f"OK: Insertados {len(datos)} seguimientos con pasos, problemas y metricas")
