from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text, Date, DateTime, String, ForeignKey, ARRAY
from datetime import date, datetime
from Models.Base import Base

class FocusGroup(Base):
    __tablename__ = "focus_groups"

    id_focus_group: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    id_proyecto: Mapped[int] = mapped_column(
        Integer, ForeignKey("proyectos.id_proyecto"), nullable=False
    )
    id_subproceso: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("subprocesos.id_subproceso"), nullable=True
    )
    id_moderador: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id_usuario"), nullable=False
    )
    titulo: Mapped[str] = mapped_column(
        String(200), nullable=False
    )
    fecha: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )
    lugar: Mapped[str | None] = mapped_column(
        String(200), nullable=True
    )
    objetivo: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    estado: Mapped[str] = mapped_column(
        String(20), default="planificado"
    )
    fecha_creacion: Mapped[datetime | None] = mapped_column(
        DateTime, default=datetime.now
    )

    transcripcion: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    tipo_media: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )

    conclusiones: Mapped[list | None] = mapped_column(
        ARRAY(Text), nullable=True
    )

    participantes: Mapped[list["FocusGroupParticipante"]] = relationship(
        "FocusGroupParticipante",
        back_populates="focus_group",
        cascade="all, delete-orphan"
    )
    temas: Mapped[list["FocusGroupTema"]] = relationship(
        "FocusGroupTema",
        back_populates="focus_group",
        cascade="all, delete-orphan",
        order_by="FocusGroupTema.orden"
    )