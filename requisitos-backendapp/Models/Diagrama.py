from Models.Base import Base
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey

from Models.ClaseArista import ClaseArista


class Diagrama(Base):
    __tablename__ = 'diagrama'

    id_diagrama: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    nombre: Mapped[str] = mapped_column(
        String(120), nullable=False
    )
    descripcion: Mapped[str] = mapped_column(
        Text
    )
    tipo: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    creado_en: Mapped[str] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    editado_en: Mapped[str] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    clase_nodos: Mapped[ list["ClaseNodo"]] = relationship(
        "ClaseNodo",
        cascade="all, delete-orphan"
    )

    clase_aristas: Mapped[ list["ClaseArista"] ] = relationship('ClaseArista', backref='diagrama', cascade='all, delete-orphan', lazy=True)

    seq_participantes: Mapped[list["SeqParticipante"]] = relationship("SeqParticipante", back_populates="diagrama",
                                                                      cascade="all, delete-orphan")
    seq_mensajes: Mapped[list["SeqMensaje"]] = relationship("SeqMensaje", back_populates="diagrama",
                                                            cascade="all, delete-orphan")