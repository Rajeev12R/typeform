from pydantic import BaseModel, ConfigDict, Field
from app.models.question import QuestionType


class QuestionOptionCreate(BaseModel):
    label: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

class QuestionOptionResponse(BaseModel):
    id: int
    label: str
    order: int

    model_config = ConfigDict(from_attributes=True)

class QuestionCreate(BaseModel):
    type: QuestionType
    title: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )
    description: str | None = None
    required: bool = False
    options: list[QuestionOptionCreate] = Field(default_factory=list)

class QuestionUpdate(BaseModel):
    type: QuestionType | None = None
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )
    description: str | None = None
    required: bool | None = None
    options: list[QuestionOptionCreate] | None = None

class QuestionResponse(BaseModel):
    id: int
    type: QuestionType
    title: str
    description: str | None
    required: bool
    order: int
    options: list[QuestionOptionResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class QuestionReorder(BaseModel):
    question_ids: list[int]