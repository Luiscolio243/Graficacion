from Models.Base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, ForeignKey


class PaqueteNodoElemento(Base):
    __tablename__ = 'paquete_nodo_elemento'

    id_elemento: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_paquete_nodo: Mapped[int] = mapped_column(
        Integer, ForeignKey('paquete_nodo.id_paquete_nodo'), nullable=False
    )
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
