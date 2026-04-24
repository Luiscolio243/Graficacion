from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, Text, Date, DateTime, String
from datetime import date, datetime
from Models.Base import Base


class Observaciones(Base):
    __tablename__ = "observaciones"

    id_observacion: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_proyecto: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    id_subproceso: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    id_observador: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    fecha_observacion: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )

    lugar: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    duracion_minutos: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    descripcion: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    problema_detectado: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    contexto: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    fecha_creacion: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )