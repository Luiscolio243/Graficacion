from Models.Base import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

class AnalisisDocumento(Base):
    __tablename__ = 'analisis_documentos'

    id_analisis     = Column(Integer, primary_key=True, autoincrement=True)
    id_proyecto     = Column(Integer, ForeignKey('proyectos.id_proyecto'), nullable=False)
    titulo          = Column(String(255), nullable=False)
    tipo_documento  = Column(String(100), nullable=False)
    fuente          = Column(String(255), nullable=False)
    id_proceso      = Column(Integer, ForeignKey('procesos.id_proceso'), nullable=True)
    id_subproceso   = Column(Integer, ForeignKey('subprocesos.id_subproceso'), nullable=True)
    recomendaciones = Column(Text, nullable=True)
    fecha_creacion  = Column(DateTime, default=datetime.utcnow)

    documentos = relationship('DocumentoAnalizado', back_populates='analisis', cascade='all, delete-orphan', order_by='DocumentoAnalizado.orden')
    hallazgos  = relationship('HallazgoAnalisis',   back_populates='analisis', cascade='all, delete-orphan', order_by='HallazgoAnalisis.orden')