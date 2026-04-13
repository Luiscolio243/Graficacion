from Models import Base, Seguimiento
from sqlalchemy.orm import Mapped, MappedColumn, relationship
from sqlalchemy import Integer, ForeignKey, String

class SeguimientoPaso(Base):
    __tablename__ = "seguimiento_pasos"

    id_seguimiento_paso: Mapped[int] = MappedColumn(
        Integer, primary_key=True, index=True
    )

    id_seguimiento: Mapped[int] = MappedColumn(
        Integer, ForeignKey("seguimiento.id_seguimiento", ondelete="CASCADE"), nullable=False
    )

    nombre: Mapped[str] = MappedColumn(
        String(150), nullable=False
    )

    duracion_min: Mapped[int] = MappedColumn(
        Integer, nullable=True
    )  # minutos que tardó el paso

    orden: Mapped[int] = MappedColumn(
        Integer, default=1
    )


    seguimiento = relationship("Seguimiento", back_populates="pasos")