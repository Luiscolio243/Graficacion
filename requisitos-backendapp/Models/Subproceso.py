from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


class Subproceso(Base):
    __tablename__ = 'subprocesos'

    id_subproceso = Column(Integer, primary_key=True, index=True)
    id_proceso = Column(Integer, ForeignKey('procesos.id_proceso'), nullable=False)
    id_stakeholder = Column(Integer, ForeignKey('stakeholders.id_stakeholder'), nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text)
    duracion_estimada_minutos = Column(Integer)
    estado = Column(String(20), default='activo')
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    # Relationships
    proceso = relationship("Proceso", back_populates="subprocesos")
    stakeholder = relationship("Stakeholder")
    tecnicas = relationship("SubprocesoTecnica", back_populates="subproceso", cascade="all, delete-orphan")