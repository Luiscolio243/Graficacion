from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, ForeignKey
from typing import Optional
from Models.Base import Base


class EncuestaPreguntas(Base):
    __tablename__ = "encuesta_preguntas"

    id_pregunta: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_encuesta: Mapped[int] = mapped_column(Integer, ForeignKey("encuestas.id_encuesta"), nullable=False)
    pregunta: Mapped[str] = mapped_column(Text, nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), default="abierta")
    orden: Mapped[int] = mapped_column(Integer, default=1)

    encuesta: Mapped["Encuestas"] = relationship(back_populates="preguntas")
    opciones: Mapped[list["EncuestaOpciones"]] = relationship(
        "EncuestaOpciones",
        back_populates="pregunta",
        cascade="all, delete-orphan"
    )
    respuestas: Mapped[list["EncuestaRespuestas"]] = relationship(
        "EncuestaRespuestas",
        back_populates="pregunta",
        cascade="all, delete-orphan"
    )