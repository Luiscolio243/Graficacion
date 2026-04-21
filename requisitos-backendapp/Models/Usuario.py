from sqlalchemy.orm import Mapped,mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey, DateTime, Boolean
from typing import Optional
from datetime import datetime

from Models import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True
    )
    nombre: Mapped[str] = mapped_column(
        String(100)
    )
    apellido: Mapped[str] = mapped_column(
        String(100)
    )
    email: Mapped[str] = mapped_column(
        String(150), unique=True
    )
    password_hash: Mapped[str] = mapped_column(
        String(255)
    )
    id_rol: Mapped[int] = mapped_column(
        Integer, ForeignKey("roles.id_rol")
    )
    fecha_registro: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )
    ultimo_acceso: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True
    )
    activo: Mapped[bool] = mapped_column(
        Boolean, default=True
    )

    rol: Mapped["Roles"] = relationship("Roles", back_populates="usuarios")