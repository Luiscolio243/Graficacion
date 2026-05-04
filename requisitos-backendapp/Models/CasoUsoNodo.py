from Models.Base import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Float, ForeignKey


class CasoUsoNodo(Base):
    __tablename__ = 'caso_uso_nodo'

    id_caso_uso_nodo: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_diagrama: Mapped[int] = mapped_column(Integer, ForeignKey('diagrama.id_diagrama'), nullable=False)

    node_id: Mapped[str] = mapped_column(String(50), nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)   # actor | useCase | system
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    pos_x: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    pos_y: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    ancho: Mapped[float] = mapped_column(Float, nullable=True)      # solo para system
    alto: Mapped[float] = mapped_column(Float, nullable=True)       # solo para system