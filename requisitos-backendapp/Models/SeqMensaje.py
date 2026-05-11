from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean, ForeignKey
from Models.Base import Base

class SeqMensaje(Base):
    __tablename__ = "seq_mensaje"

    id_seq_mensaje: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_diagrama: Mapped[int] = mapped_column(Integer, ForeignKey("diagrama.id_diagrama"), nullable=False)
    edge_id: Mapped[str] = mapped_column(String(20), nullable=False)
    source_id: Mapped[str] = mapped_column(String(20), nullable=False)
    target_id: Mapped[str] = mapped_column(String(20), nullable=False)
    contenido: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo: Mapped[str] = mapped_column(String(15), nullable=False, default="sync")
    orden: Mapped[int] = mapped_column(Integer, nullable=False)
    es_self: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    diagrama: Mapped["Diagrama"] = relationship("Diagrama", back_populates="seq_mensajes")