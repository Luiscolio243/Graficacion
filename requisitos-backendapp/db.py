from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from config import Config

# Base única para todos los modelos
class Base(DeclarativeBase):
    pass

# Engine
engine = create_engine(Config.DATABASE_URL, echo=True)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

secret_key = Config.SECRET_KEY