from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class Tecnica(Base):
    __tablename__ = 'tecnicas'

    id_tecnica = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False, unique=True)
    descripcion = Column(Text)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relación con subprocesos a través de tabla intermedia
    subprocesos = relationship("SubprocesoTecnica", back_populates="tecnica", cascade="all, delete-orphan")
