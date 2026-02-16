from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

# Pasar credenciales por separado evita problemas de codificación
connection_url = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="Fernando2003",
    host="localhost",
    port=5432,
    database="Graficacion "
)

engine = create_engine(connection_url)

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Conexión exitosa a PostgreSQL")
except Exception as e:
    print(f"❌ Error al conectar: {e}")