from Models.Base import Base
from sqlalchemy.orm import MappedColumn, Mapped, relationship
from sqlalchemy import Integer, ForeignKey, String


class SeguimientoMetrica(Base):
    __tablename__ = "seguimiento_metricas"

    id_seguimiento_metrica: Mapped[int] = MappedColumn(Integer, primary_key=True, index=True)
    id_seguimiento: Mapped[int] = MappedColumn(Integer, ForeignKey("seguimiento.id_seguimiento", ondelete="CASCADE"), nullable=False)
    nombre: Mapped[str] = MappedColumn(String(150), nullable=True)  # ej: "Tiempo real"
    valor: Mapped[str] = MappedColumn(String(100), nullable=True)  # ej: "4.5 horas"

    # Relación de vuelta al seguimiento padre
    seguimiento = relationship("Seguimiento", back_populates="metricas")