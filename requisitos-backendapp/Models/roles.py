from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer
from Models import Base

class Roles(Base):
    __tablename__ = "roles"

    id_rol: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )

    nombre: Mapped[str] = mapped_column(
        String(50)
    )

    descripcion: Mapped[str] = mapped_column(
        String(50)
    )

    usuarios: Mapped[list["Usuario"]] = relationship("Usuario", back_populates="rol")
