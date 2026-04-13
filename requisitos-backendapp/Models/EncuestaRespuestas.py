from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, DateTime, ForeignKey
from datetime import datetime
from typing import Optional
from Models.Base import Base

class EncuestaRespuestas(Base):
    __tablename__ = "encuesta_respuestas"

    id_respuesta: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_encuesta: Mapped[int] = mapped_column(Integer, ForeignKey("encuestas.id_encuesta"), nullable=False)
    id_pregunta: Mapped[int] = mapped_column(Integer, ForeignKey("encuesta_preguntas.id_pregunta"), nullable=False)
    id_stakeholder: Mapped[int] = mapped_column(Integer, ForeignKey("stakeholders.id_stakeholder"), nullable=False)
    respuesta: Mapped[Optional[str]] = mapped_column(Text)
    fecha_respuesta: Mapped[Optional[datetime]] = mapped_column(DateTime)

    encuesta: Mapped["Encuestas"] = relationship(back_populates="respuestas")
    pregunta: Mapped["EncuestaPreguntas"] = relationship(back_populates="respuestas")