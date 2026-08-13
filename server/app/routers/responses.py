from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.response import (AnswerResponse,ResponseDetail,ResponseListItem)
from app.services import response_service

router = APIRouter(
    prefix="/api/forms/{form_id}/responses",
    tags=["Responses"],
)

@router.get(
    "",
    response_model=list[ResponseListItem],
)
def list_responses(
    form_id: int,
    db: Session = Depends(get_db),
):
    return response_service.get_responses(
        db,
        form_id,
    )

@router.get(
    "/{response_id}",
    response_model=ResponseDetail,
)
def get_response(
    form_id: int,
    response_id: int,
    db: Session = Depends(get_db),
):
    response = response_service.get_response(
        db,
        form_id,
        response_id,
    )

    return response
