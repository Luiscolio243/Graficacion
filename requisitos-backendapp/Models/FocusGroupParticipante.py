from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer
from Models.Base import Base


class FocusGroupParticipante(Base):
    __tablename__ = "focus_group_participantes"

    id_participante: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    id_focus_group: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    id_stakeholder: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    focus_group: Mapped["FocusGroup"] = relationship(
        "FocusGroup",
        back_populates="participantes"
    )