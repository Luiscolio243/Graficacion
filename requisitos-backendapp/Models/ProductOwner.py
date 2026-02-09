from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class ProductOwner(Base):
    __tablename__ = "product_owners"

    id_product_owner: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    id_proyecto: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    id_usuario: Mapped[int] = mapped_column(
        Integer,nullable=False
    )

    nombre: Mapped[str] = mapped_column(
        Text
    )

    correo: Mapped[str] = mapped_column(
        Text
    )
