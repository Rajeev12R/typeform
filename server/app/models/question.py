from enum import Enum
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class QuestionType(str, Enum):
    SHORT_TEXT = "short_text"
    LONG_TEXT = "long_text"
    MULTIPLE_CHOICE = "multiple_choice"
    RADIO = "radio"
    DROPDOWN = "dropdown"
    EMAIL = "email"
    NUMBER = "number"
    YES_NO = "yes_no"
    RATING = "rating"

class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )
    form_id: Mapped[int] = mapped_column(
        ForeignKey("forms.id"),
        nullable=False,
        index=True,
    )
    type: Mapped[QuestionType] = mapped_column(
        String(50),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    required: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    form = relationship(
        "Form",
        back_populates="questions",
    )
    options = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.order",
    )
    answers = relationship(
        "Answer",
        back_populates="question",
    )

class QuestionOption(Base):
    __tablename__ = "question_options"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("questions.id"),
        nullable=False,
        index=True,
    )
    label: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    question = relationship(
        "Question",
        back_populates="options",
    )