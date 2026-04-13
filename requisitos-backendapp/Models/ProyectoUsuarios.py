from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from Models import Base

class ProyectoUsuarios(Base):
    __tablename__ = 'proyecto_usuarios'

    id_proyecto_usuario = Column(Integer, primary_key=True)
    id_proyecto = Column(Integer, ForeignKey('proyectos.id_proyecto'))
    id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'))
    rol_en_proyecto = Column(String(20))
    fecha_asignacion = Column(DateTime)