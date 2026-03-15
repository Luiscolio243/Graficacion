from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase
from db import Base

class Tecnica(Base):
    __tablename__ = 'tecnicas'

    id_tecnica = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False, unique=True)
    descripcion = Column(Text)
    
    # Relación con subprocesos a traves de tabla intermedia
    subprocesos = relationship("SubprocesoTecnica", back_populates="tecnica", cascade="all, delete-orphan")
