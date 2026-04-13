from Models.Base import Base
from sqlalchemy.orm import MappedColumn, Mapped, relationship
from sqlalchemy import Integer, ForeignKey, Text


class SeguimientoProblema(Base):
    __tablename__ = "seguimiento_problemas"

    id_seguimiento_problema: Mapped[int] = MappedColumn(Integer, primary_key=True, index=True)
    id_seguimiento: Mapped[int] = MappedColumn(Integer, ForeignKey("seguimiento.id_seguimiento", ondelete="CASCADE"), nullable=False)
    descripcion: Mapped[str] = MappedColumn(Text, nullable=False)

    # Relación de vuelta al seguimiento padre
    seguimiento = relationship("Seguimiento", back_populates="problemas")