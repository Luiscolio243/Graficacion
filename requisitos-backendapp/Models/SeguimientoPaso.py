from Models import Base
from sqlalchemy.orm import Mapped, MappedColumn

class SeguimientoPaso(Base):
    __tablename__ = "seguimiento_pasos"

    id_seguimiento_paso = Column(Integer, primary_key=True, index=True)
    id_seguimiento = Column(Integer, ForeignKey("seguimiento.id", ondelete="CASCADE"), nullable=False)
    nombre = Column(String(150), nullable=False)
    duracion_min = Column(Integer, nullable=True)  # minutos que tardó el paso
    orden = Column(Integer, default=1)


    seguimiento = relationship("Seguimiento", back_populates="pasos")