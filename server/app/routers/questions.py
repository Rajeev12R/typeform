from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.question import (QuestionCreate,QuestionReorder,QuestionResponse,QuestionUpdate)
from app.services import question_service
from app.dependencies import get_current_user
from app.models.user import User

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
    current_user: User = Depends(get_current_user),
):
    return question_service.create_question(
        db,
        form_id,
        data,
        current_user.id,
    )

@router.patch(
    "/questions/{question_id}",
    response_model=QuestionResponse,
)
def update_question(
    question_id: int,
    data: QuestionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return question_service.update_question(
        db,
        question_id,
        data,
        current_user.id,
    )

@router.delete(
    "/questions/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    question_service.delete_question(
        db,
        question_id,
        current_user.id,
    )

@router.patch(
    "/forms/{form_id}/questions/reorder",
    response_model=list[QuestionResponse],
)
def reorder_questions(
    form_id: int,
    data: QuestionReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return question_service.reorder_questions(
        db,
        form_id,
        data.question_ids,
        current_user.id,
    )