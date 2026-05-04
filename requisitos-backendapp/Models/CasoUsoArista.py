from Models.Base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, ForeignKey


class CasoUsoArista(Base):
    __tablename__ = 'caso_uso_arista'

    id_caso_uso_arista: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_diagrama: Mapped[int] = mapped_column(Integer, ForeignKey('diagrama.id_diagrama'), nullable=False)

    id_edge: Mapped[str] = mapped_column(String(50), nullable=False)
    id_source: Mapped[str] = mapped_column(String(50), nullable=False)
    id_target: Mapped[str] = mapped_column(String(50), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)   
    handle_origen: Mapped[str] = mapped_column(String(10), nullable=True)
    handle_destino: Mapped[str] = mapped_column(String(10), nullable=True)