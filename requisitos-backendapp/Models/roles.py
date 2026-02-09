from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Text, Date, DateTime
from datetime import date, datetime

class Base(DeclarativeBase):
    pass

class Roles(Base):
    __tablename__ = "roles"

    id_rol: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    nombre: Mapped[str] = mapped_column(
        Text
    )

    descripcion: Mapped[str] = mapped_column(
        Text
    )
