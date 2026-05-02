from Models.Base import Base
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Float

from Models.ClaseNodoMetodo import ClaseNodoMetodo


class ClaseNodo(Base):
    __tablename__ = 'clase_nodo'

    id_clase_nodo: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    id_diagrama: Mapped[int] = mapped_column(
        Integer, ForeignKey('diagrama.id_diagrama'), nullable=False
    )

    node_id : Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    tipo: Mapped[str] = mapped_column(
        String(15), nullable=False
    )
    nombre: Mapped[str]  = mapped_column(
        String(100), nullable=False
    )
    pos_x: Mapped[float]  = mapped_column(
        Float, nullable=False, default=0
    )
    pos_y: Mapped[float] = mapped_column(
        Float, nullable=False, default=0
    )

    atributos: Mapped[ list["ClaseNodoAtributo"]] = relationship('ClaseNodoAtributo', cascade='all, delete-orphan', lazy=True, order_by='ClaseNodoAtributo.orden')
    metodos: Mapped[ list["ClaseNodoMetodo"] ]   = relationship('ClaseNodoMetodo',  cascade='all, delete-orphan', lazy=True, order_by='ClaseNodoMetodo.orden')
