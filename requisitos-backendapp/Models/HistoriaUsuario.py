from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Text, String, ARRAY, DateTime, ForeignKey
from datetime import datetime
from typing import Optional
from Models.Base import Base

class HistoriaUsuario(Base):
    __tablename__ = "historias_usuario"

    id_historia: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_proyecto: Mapped[int] = mapped_column(Integer, ForeignKey("proyectos.id_proyecto"), nullable=False)
    id_subproceso: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("subprocesos.id_subproceso"))
    titulo: Mapped[str] = mapped_column(Text, nullable=False)
    rol: Mapped[str] = mapped_column(Text, nullable=False)
    accion: Mapped[str] = mapped_column(Text, nullable=False)
    beneficio: Mapped[str] = mapped_column(Text, nullable=False)
    prioridad: Mapped[str] = mapped_column(String(10), nullable=False)
    estimacion: Mapped[Optional[str]] = mapped_column(Text)
    criterios: Mapped[Optional[list]] = mapped_column(ARRAY(Text))
    fecha_creacion: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.now)