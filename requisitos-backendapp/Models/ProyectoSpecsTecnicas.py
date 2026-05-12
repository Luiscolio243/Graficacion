from Models.Base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from typing import Optional


class ProyectoSpecsTecnicas(Base):
    __tablename__ = 'proyecto_specs_tecnicas'

    id_specs_tecnicas: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_proyecto: Mapped[int] = mapped_column(Integer, ForeignKey('proyectos.id_proyecto'), nullable=False)

    # Frontend
    frontend_framework: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    frontend_libreria_ui: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    frontend_manejo_estado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Backend
    backend_lenguaje: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    backend_framework: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    backend_tipo_api: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Base de datos
    bd_motor: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    bd_orm: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Seguridad
    seg_autenticacion: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    seg_roles: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    seg_cifrado: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Infraestructura
    infra_despliegue: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    infra_contenedores: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Extra
    restricciones_adicionales: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    fecha_creacion: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.now)
    fecha_actualizacion: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)