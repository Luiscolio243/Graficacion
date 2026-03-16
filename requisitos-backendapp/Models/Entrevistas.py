from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime, func, Boolean
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class Entrevistas(Base):
    __tablename__ = "entrevistas"

    id_entrevista: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_proyecto: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    titulo: Mapped[str] = mapped_column(
        Text
    )

    id_subproceso: Mapped[int] = mapped_column(
        Integer
    )

    id_stakeholder: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    id_entrevistador: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    fecha_programada: Mapped[date] = mapped_column(
        Date
    )

    duracion_minutos: Mapped[int] = mapped_column(
        Integer
    )

    lugar: Mapped[str] = mapped_column(
        Text
    )

    objetivo: Mapped[str] = mapped_column(
        Text
    )

    estado: Mapped[str] = mapped_column(
        Text
    )

    audio_url: Mapped[str] = mapped_column(
        Text
    )

    procesado_ia: Mapped[bool] = mapped_column(
        Boolean, default=False
    )

    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime
    )

    fecha_realizada: Mapped[datetime] = mapped_column(
        DateTime
    )
