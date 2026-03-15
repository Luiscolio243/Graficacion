from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import relationship
from db import Base


class Proceso(Base):
    __tablename__ = 'procesos'

    id_proceso = Column(Integer, primary_key=True, index=True)
    id_proyecto = Column(Integer, ForeignKey('proyectos.id_proyecto'), nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    objetivo = Column(Text)
    area_responsable = Column(String(100))
    id_responsable = Column(Integer)
    estado = Column(String(20), default='activo')
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    #Relaciones
    subprocesos = relationship("Subproceso", back_populates="proceso")
