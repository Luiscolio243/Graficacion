from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from Models.Base import Base

class SubprocesoTecnica(Base):
    # Tabla intermedia para relación muchos a muchos
    __tablename__ = 'subproceso_tecnicas'

    id_subproceso_tecnica = Column(Integer, primary_key=True, index=True)
    id_subproceso = Column(Integer, ForeignKey('subprocesos.id_subproceso'), nullable=False)
    id_tecnica = Column(Integer, ForeignKey('tecnicas.id_tecnica'), nullable=False)
    fecha_aplicacion = Column(DateTime, default=datetime.utcnow)

    #Relaciones
    subproceso = relationship("Subproceso", back_populates="tecnicas")
    tecnica = relationship("Tecnica", back_populates="subprocesos")
