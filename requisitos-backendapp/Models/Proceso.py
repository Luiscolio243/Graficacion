from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class Proceso(Base):
    __tablename__ = 'procesos'

    id_proceso = Column(Integer, primary_key=True, index=True)
    id_proyecto = Column(Integer, ForeignKey('proyectos.id_proyecto'), nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    objetivo = Column(Text)
    area_responsable = Column(String(100))
    id_responsable = Column(Integer, ForeignKey('usuarios.id_usuario'))
    estado = Column(String(20), default='activo')
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relationships
    proyecto = relationship("Proyecto", back_populates="procesos")
    responsable = relationship("Usuario")
    subprocesos = relationship("Subproceso", back_populates="proceso", cascade="all, delete-orphan")

