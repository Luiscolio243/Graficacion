from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PersonalTI(Base):
    """
    Mapea la tabla `personal_ti` de tu BD.
    """

    __tablename__ = "personal_ti"

    id_personal_ti: Mapped[int] = mapped_column(Integer, primary_key=True)

    id_tech_leader: Mapped[int] = mapped_column(
        Integer, ForeignKey("tech_leaders.id_tech_leader"), nullable=False
    )

    id_proyecto: Mapped[int] = mapped_column(
        Integer, ForeignKey("proyectos.id_proyecto"), nullable=False
    )

    id_usuario: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=False
    )

    nombre: Mapped[str] = mapped_column(Text, nullable=False)
    correo: Mapped[str | None] = mapped_column(Text)

    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    fecha_asignacion: Mapped[datetime | None] = mapped_column(DateTime)

    id_rol: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id_rol"), nullable=False)