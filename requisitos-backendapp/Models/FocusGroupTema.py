from __future__ import annotations
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, Text
from Models.Base import Base

class FocusGroupTema(Base):
    __tablename__ = "focus_group_temas"

    id_tema: Mapped[int] = mapped_column(
        Integer, primary_key=True
    )
    id_focus_group: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    tema: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    conclusiones: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    orden: Mapped[int] = mapped_column(
        Integer, default=1
    )

    focus_group: Mapped["FocusGroup"] = relationship(
        "FocusGroup",
        back_populates="temas"
    )