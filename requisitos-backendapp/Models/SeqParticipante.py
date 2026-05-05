from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey
from Models.Base import Base


class SeqParticipante(Base):
    __tablename__ = "seq_participante"

    id_seq_participante: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_diagrama: Mapped[int] = mapped_column(Integer, ForeignKey("diagrama.id_diagrama"), nullable=False)
    id_nodo: Mapped[str] = mapped_column(String(20), nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo: Mapped[str] = mapped_column(String(15), nullable=False, default="object")
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    diagrama: Mapped["Diagrama"] = relationship("Diagrama", back_populates="seq_participantes")