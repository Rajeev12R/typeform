from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.question import QuestionResponse
from app.schemas.response import ResponseCreate
from app.services import response_service


router = APIRouter(
    prefix="/api/public/forms",
    tags=["Public Forms"],
)

@router.get(
    "/{public_id}",
)
def get_public_form(
    public_id: str,
    db: Session = Depends(get_db),
):
    form = response_service.get_public_form(
        db,
        public_id,
    )
    return {
        "id": form.id,
        "title": form.title,
        "public_id": form.public_id,
        "questions": [
            QuestionResponse.model_validate(question)
            for question in form.questions
        ],
    }

@router.post(
    "/{public_id}/responses",
    status_code=status.HTTP_201_CREATED,
)
def submit_response(
    public_id: str,
    data: ResponseCreate,
    db: Session = Depends(get_db),
):
    response = response_service.submit_response(
        db,
        public_id,
        data,
    )
    return {
        "id": response.id,
        "message": "Response submitted successfully",
    }