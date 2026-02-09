from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime, func
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class Stakeholders(Base):
    __tablename__ = "stakeholders"

    id_stakeholder: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_proyecto: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    nombre: Mapped[str] = mapped_column(
        Text
    )

    rol: Mapped[str] = mapped_column(
        Text
    )

    tipo: Mapped[str] = mapped_column(
        Text
    )

    email: Mapped[str] = mapped_column(
        Text
    )

    telefono: Mapped[str] = mapped_column(
        Text
    )

    organizacion: Mapped[str] = mapped_column(
        Text
    )

    notas: Mapped[str] = mapped_column(
        Text
    )

    from sqlalchemy import func

    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        server_default=func.now()
    )

