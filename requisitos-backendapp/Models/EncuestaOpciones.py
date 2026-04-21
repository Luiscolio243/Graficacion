from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, ForeignKey
from Models.Base import Base

class EncuestaOpciones(Base):
    __tablename__ = "encuesta_opciones"

    id_opcion: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_pregunta: Mapped[int] = mapped_column(Integer, ForeignKey("encuesta_preguntas.id_pregunta"), nullable=False)
    opcion: Mapped[str] = mapped_column(Text, nullable=False)
    orden: Mapped[int] = mapped_column(Integer, default=1)

    pregunta: Mapped["EncuestaPreguntas"] = relationship(back_populates="opciones")