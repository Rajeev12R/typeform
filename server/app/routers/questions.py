from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.question import (QuestionCreate,QuestionReorder,QuestionResponse,QuestionUpdate)
from app.services import question_service

router = APIRouter(
    prefix="/api",
    tags=["Questions"],
)

@router.post(
    "/forms/{form_id}/questions",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    form_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
):
    return question_service.create_question(
        db,
        form_id,
        data,
    )

@router.patch(
    "/questions/{question_id}",
    response_model=QuestionResponse,
)
def update_question(
    question_id: int,
    data: QuestionUpdate,
    db: Session = Depends(get_db),
):
    return question_service.update_question(
        db,
        question_id,
        data,
    )

@router.delete(
    "/questions/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    question_service.delete_question(
        db,
        question_id,
    )

@router.patch(
    "/forms/{form_id}/questions/reorder",
    response_model=list[QuestionResponse],
)
def reorder_questions(
    form_id: int,
    data: QuestionReorder,
    db: Session = Depends(get_db),
):
    return question_service.reorder_questions(
        db,
        form_id,
        data.question_ids,
    )