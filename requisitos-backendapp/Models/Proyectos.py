from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class Proyecto(Base):
    __tablename__ = "proyectos"

    id_proyecto: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    nombre: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

    descripcion: Mapped[str | None] = mapped_column(
        Text
    )

    objetivo_general: Mapped[str | None] = mapped_column(
        Text
    )

    fecha_inicio: Mapped[date | None] = mapped_column(
        Date
    )

    fecha_fin: Mapped[date | None] = mapped_column(
        Date
    )

    estado: Mapped[str | None] = mapped_column(
        String(20)
    )


    id_creador: Mapped[int | None] = mapped_column(
        Integer
    )

    fecha_creacion: Mapped[datetime | None] = mapped_column(
        DateTime
    )

    fecha_actualizacion: Mapped[datetime | None] = mapped_column(
        DateTime
    )