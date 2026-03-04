import os
from dotenv import load_dotenv

# Carga las variables de entorno del archivo .env
load_dotenv()

class Config:
    # Base de datos

    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")

    DATABASE_URL = (f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}"f"@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback_inseguro")

    # Flask
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))

    @staticmethod
    def validate():
        """Valida que las variables críticas estén definidas al arrancar."""
        required = ["DATABASE_URL", "SECRET_KEY"]
        missing = [var for var in required if not os.getenv(var)]
        if missing:
            raise EnvironmentError(f"Faltan variables de entorno: {', '.join(missing)}")
        else:
            print("variables de entorno cargadas")