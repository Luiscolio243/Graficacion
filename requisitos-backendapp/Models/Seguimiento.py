from Models import Base
from sqlalchemy.orm import Mapped, MappedColumn, relationship
from sqlalchemy import Integer, ForeignKey, String, DateTime
from typing import Optional
from datetime import datetime


class Seguimiento(Base):
    __tablename__ = 'seguimiento'

    id_seguimiento: Mapped[int] = MappedColumn(
        Integer, primary_key=True
    )
    id_proyecto: Mapped[int] = MappedColumn(
        Integer, ForeignKey("proyectos.id_proyecto")
    )
    id_proceso: Mapped[int] = MappedColumn(
        Integer, ForeignKey("procesos.id_proceso")
    )
    id_subproceso: Mapped[int] = MappedColumn(
        Integer, ForeignKey("subprocesos.id_subproceso")
    )
    id_responsable: Mapped[Optional[int]] = MappedColumn(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=True
    )
    titulo: Mapped[str] = MappedColumn(
        String(150)
    )
    id_transaccion: Mapped[str] = MappedColumn(
        String(100)
    )
    nombre_proceso: Mapped[str] = MappedColumn(
        String(150)
    )
    fecha_creacion: Mapped[Optional[datetime]] = MappedColumn(
        DateTime
    )

    pasos = relationship("SeguimientoPaso", back_populates="seguimiento", cascade="all, delete")
    problemas = relationship("SeguimientoProblema", back_populates="seguimiento", cascade="all, delete")
    metricas = relationship("SeguimientoMetrica", back_populates="seguimiento", cascade="all, delete")

