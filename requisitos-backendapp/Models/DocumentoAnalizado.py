from Models.Base import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

class DocumentoAnalizado(Base):
    __tablename__ = 'documentos_analizados'

    id_documento = Column(Integer, primary_key=True, autoincrement=True)
    id_analisis  = Column(Integer, ForeignKey('analisis_documentos.id_analisis'), nullable=False)
    nombre       = Column(String(255), nullable=False)
    tipo         = Column(String(100), nullable=True)
    url          = Column(String(500), nullable=True)
    descripcion  = Column(Text, nullable=True)
    orden        = Column(Integer, default=1)

    analisis = relationship('AnalisisDocumento', back_populates='documentos')