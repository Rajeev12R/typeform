from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Response(Base):
    __tablename__ = "responses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )
    form_id: Mapped[int] = mapped_column(
        ForeignKey("forms.id"),
        nullable=False,
        index=True,
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    form = relationship(
        "Form",
        back_populates="responses",
    )
    answers = relationship(
        "Answer",
        back_populates="response",
        cascade="all, delete-orphan",
    )

class Answer(Base):
    __tablename__ = "answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )
    response_id: Mapped[int] = mapped_column(
        ForeignKey("responses.id"),
        nullable=False,
        index=True
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"),
        nullable=False,
        index=True
    )
    value: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    response = relationship(
        "Response",
        back_populates="answers",
    )
    question = relationship(
        "Question",
        back_populates="answers",
    )