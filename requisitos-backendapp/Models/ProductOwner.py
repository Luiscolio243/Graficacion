from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime
from datetime import date, datetime
from Models.Base import Base


class ProductOwner(Base):
    __tablename__ = "product_owners"

    id_product_owner: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_proyecto: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    id_usuario: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )

    nombre: Mapped[str | None] = mapped_column(
        String(50)
    )

    correo: Mapped[str | None] = mapped_column(
        String(100)
    )

    telefono: Mapped[str | None] = mapped_column(
        String(10)
    )
