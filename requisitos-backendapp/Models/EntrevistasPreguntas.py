from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime, func, Boolean, ForeignKey
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class EntrevistaPreguntas(Base):
    __tablename__ = "entrevistas_preguntas"

    id_ent_prg: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_entrevista: Mapped[int] = mapped_column(
        Integer, ForeignKey("entrevistas.id_entrevista")
    )

    pregunta : Mapped[str] = mapped_column(
        Text
    )

    respuesta: Mapped[str] = mapped_column(
        Text
    )

    orden: Mapped[int] = mapped_column(
        Integer
    )

    origen: Mapped[str] = mapped_column(
        Text
    )

    timestamp_audio: Mapped[int] = mapped_column(
        Integer
    )