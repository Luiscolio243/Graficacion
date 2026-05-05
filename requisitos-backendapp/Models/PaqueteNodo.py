from Models.Base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Float, ForeignKey


class PaqueteNodo(Base):
    __tablename__ = 'paquete_nodo'

    id_paquete_nodo: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_diagrama: Mapped[int] = mapped_column(
        Integer, ForeignKey('diagrama.id_diagrama'), nullable=False
    )
    node_id: Mapped[str] = mapped_column(String(50), nullable=False)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    pos_x: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    pos_y: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    elementos: Mapped[list["PaqueteNodoElemento"]] = relationship(
        'PaqueteNodoElemento',
        cascade='all, delete-orphan',
        lazy=True,
        order_by='PaqueteNodoElemento.orden'
    )
