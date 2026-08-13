from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AnswerCreate(BaseModel):
    question_id: int
    value: str

class ResponseCreate(BaseModel):
    answers: list[AnswerCreate]

class AnswerResponse(BaseModel):
    id: int
    question_id: int
    value: str

    model_config = ConfigDict(from_attributes=True)

class ResponseSummary(BaseModel):
    id: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ResponseDetail(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    answers: list[AnswerResponse]

    model_config = ConfigDict(from_attributes=True)

class ResponseListItem(BaseModel):
    id: int
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StatisticsItem(BaseModel):
    question_id: int
    question_title: str
    question_type: str
    total_answers: int
    distribution: dict[str, int]

class FormStatistics(BaseModel):
    form_id: int
    total_responses: int
    questions: list[StatisticsItem]