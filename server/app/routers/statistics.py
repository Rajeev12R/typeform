from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.response import FormStatistics
from app.services import statistics_service

router = APIRouter(
    prefix="/api/forms",
    tags=["Statistics"],
)

@router.get(
    "/{form_id}/statistics",
    response_model=FormStatistics,
)
def get_statistics(
    form_id: int,
    db: Session = Depends(get_db),
):
    return statistics_service.get_statistics(
        db,
        form_id,
    )