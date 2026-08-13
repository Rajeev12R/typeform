from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.form import ( FormCreate, FormDetail, FormSummary, FormUpdate)
from app.services import form_service


router = APIRouter(
    prefix="/api/forms",
    tags=["Forms"],
)


@router.get(
    "",
    response_model=list[FormSummary],
)
def list_forms(
    db: Session = Depends(get_db),
):
    forms = form_service.get_forms(db)

    return [
        FormSummary(
            id=form.id,
            title=form.title,
            status=form.status,
            public_id=form.public_id,
            response_count=len(form.responses),
            created_at=form.created_at,
            updated_at=form.updated_at,
        )
        for form in forms
    ]


@router.get(
    "/{form_id}",
    response_model=FormDetail,
)
def get_form(
    form_id: int,
    db: Session = Depends(get_db),
):
    return form_service.get_form_by_id(
        db,
        form_id,
    )

@router.post(
    "",
    response_model=FormDetail,
    status_code=status.HTTP_201_CREATED,
)
def create_form(
    data: FormCreate,
    db: Session = Depends(get_db),
):
    return form_service.create_form(
        db,
        data,
    )

@router.patch(
    "/{form_id}",
    response_model=FormDetail,
)
def update_form(
    form_id: int,
    data: FormUpdate,
    db: Session = Depends(get_db),
):
    return form_service.update_form(
        db,
        form_id,
        data,
    )

@router.delete(
    "/{form_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_form(
    form_id: int,
    db: Session = Depends(get_db),
):
    form_service.delete_form(
        db,
        form_id,
    )

@router.post(
    "/{form_id}/publish",
    response_model=FormDetail,
)
def publish_form(
    form_id: int,
    db: Session = Depends(get_db),
):
    return form_service.publish_form(
        db,
        form_id,
    )

@router.post(
    "/{form_id}/unpublish",
    response_model=FormDetail,
)
def unpublish_form(
    form_id: int,
    db: Session = Depends(get_db),
):
    return form_service.unpublish_form(
        db,
        form_id,
    )

@router.post(
    "/{form_id}/duplicate",
    response_model=FormDetail,
    status_code=status.HTTP_201_CREATED,
)
def duplicate_form(
    form_id: int,
    db: Session = Depends(get_db),
):
    return form_service.duplicate_form(
        db,
        form_id,
    )