from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from typing import Optional
from Models.Base import Base

class Encuestas(Base):
    __tablename__ = "encuestas"

    id_encuesta: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_proyecto: Mapped[int] = mapped_column(Integer, ForeignKey("proyectos.id_proyecto"), nullable=False)
    id_subproceso: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("subprocesos.id_subproceso"))
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(Text)
    num_participantes: Mapped[int] = mapped_column(Integer, default=0)
    estado: Mapped[str] = mapped_column(String(20), default="borrador")
    fecha_creacion: Mapped[Optional[datetime]] = mapped_column(DateTime)

    preguntas: Mapped[list["EncuestaPreguntas"]] = relationship(
        "EncuestaPreguntas",
        back_populates="encuesta",
        cascade="all, delete-orphan"
    )
    respuestas: Mapped[list["EncuestaRespuestas"]] = relationship(
        "EncuestaRespuestas",
        back_populates="encuesta",
        cascade="all, delete-orphan"
    )