from Models.Base import Base
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Float


class ClaseNodoAtributo(Base):
    __tablename__ = 'clase_nodo_atributo'

    id_clase_nodo_atributo: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    id_clase_nodo: Mapped[int] = mapped_column(
        Integer, ForeignKey('clase_nodo.id_clase_nodo'), nullable=False
    )
    visibilidad: Mapped[str] = mapped_column(
        String(1), nullable=False
    )
    nombre: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    tipo_dato: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    orden: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )