from Models.Base import Base
from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship

class HallazgoAnalisis(Base):
    __tablename__ = 'hallazgos_analisis'

    id_hallazgo = Column(Integer, primary_key=True, autoincrement=True)
    id_analisis = Column(Integer, ForeignKey('analisis_documentos.id_analisis'), nullable=False)
    descripcion = Column(Text, nullable=False)
    orden       = Column(Integer, default=1)

    analisis = relationship('AnalisisDocumento', back_populates='hallazgos')