from datetime import datetime
from enum import Enum
from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, String
from sqlalchemy.orm import Mapped,mapped_column, relationship

from app.database import Base

class FormStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"

class Form(Base):
    __tablename__ = "forms"
    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    status: Mapped[FormStatus] = mapped_column(
        SQLEnum(FormStatus),
        default=FormStatus.DRAFT,
        nullable=False,
    )
    public_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
    creator = relationship(
        "User",
        back_populates="forms",
    )
    questions = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.order",
    )
    responses = relationship(
        "Response",
        back_populates="form",
        cascade="all, delete-orphan",
    )