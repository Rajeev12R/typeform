from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.form import FormStatus
from app.schemas.question import QuestionResponse

class FormCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

class FormUpdate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

class FormSummary(BaseModel):
    id: int
    title: str
    status: FormStatus
    public_id: str
    response_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FormDetail(FormSummary):
    questions: list[QuestionResponse] = Field(
        default_factory=list
    )