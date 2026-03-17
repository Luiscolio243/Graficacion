from __future__ import annotations  #Evita el problema circular de forma que no se preocupa si se ha definido ya una clase
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime, func, Boolean, ForeignKey
from datetime import date, datetime
from Models.Base import Base
from typing import Optional

class EntrevistaPreguntas(Base):
    __tablename__ = "entrevista_preguntas"

    id_ent_prg: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_entrevista: Mapped[int] = mapped_column(
        Integer, ForeignKey("entrevistas.id_entrevista"), nullable=False
    )

    pregunta : Mapped[str] = mapped_column(
        Text
    )

    respuesta: Mapped[Optional[str]] = mapped_column(
        Text
    )

    orden: Mapped[int] = mapped_column(
        Integer
    )

    origen: Mapped[str] = mapped_column(
        Text
    )

    timestamp_audio: Mapped[Optional[int]] = mapped_column(
        Integer
    )

    entrevista: Mapped["Entrevistas"] = relationship(back_populates="preguntas")
