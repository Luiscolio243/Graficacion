from Models.Base import Base
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Float



class ClaseArista(Base):
    __tablename__ = 'clase_arista'

    id_clase_arista: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    id_diagrama: Mapped[int] = mapped_column(
        Integer, ForeignKey('diagrama.id_diagrama'), nullable=False
    )
    id_edge: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    id_source: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    id_target: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    tipo: Mapped[str] = mapped_column(
        String(15), nullable=False
    )
    etiqueta: Mapped[str] = mapped_column(
        String(100)
    )