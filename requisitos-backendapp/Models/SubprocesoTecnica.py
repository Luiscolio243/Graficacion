from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class SubprocesoTecnica(Base):
    # Tabla intermedia para relación muchos a muchos
    __tablename__ = 'subprocesos_tecnicas'

    id_subproceso_tecnica = Column(Integer, primary_key=True, index=True)
    id_subproceso = Column(Integer, ForeignKey('subprocesos.id_subproceso'), nullable=False)
    id_tecnica = Column(Integer, ForeignKey('tecnicas.id_tecnica'), nullable=False)
    fecha_asignacion = Column(DateTime, default=datetime.utcnow)

    subproceso = relationship("Subproceso", back_populates="tecnicas")
    tecnica = relationship("Tecnica", back_populates="subprocesos")
