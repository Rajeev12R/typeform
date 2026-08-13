import secrets
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.config import DEFAULT_CREATOR_ID
from app.models.form import Form, FormStatus
from app.models.question import Question
from app.models.response import Response
from app.schemas.form import FormCreate, FormUpdate


def generate_public_id() -> str:
    return secrets.token_urlsafe(8)

def get_forms(db: Session) -> list[Form]:
    statement = (
        select(Form)
        .where(Form.user_id == DEFAULT_CREATOR_ID)
        .options(selectinload(Form.responses))
        .order_by(Form.updated_at.desc())
    )

    return list(db.scalars(statement).unique().all())

def get_form_by_id(
    db: Session,
    form_id: int,
) -> Form:

    statement = (
        select(Form)
        .where(
            Form.id == form_id,
            Form.user_id == DEFAULT_CREATOR_ID,
        )
        .options(
            selectinload(Form.questions).selectinload(
                Question.options
            ),
            selectinload(Form.responses),
        )
    )

    form = db.scalars(statement).unique().first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )

    return form

def create_form(
    db: Session,
    data: FormCreate,
) -> Form:

    form = Form(
        user_id=DEFAULT_CREATOR_ID,
        title=data.title.strip(),
        status=FormStatus.DRAFT,
        public_id=generate_public_id(),
    )

    db.add(form)
    db.commit()
    db.refresh(form)

    return form

def update_form(
    db: Session,
    form_id: int,
    data: FormUpdate,
) -> Form:

    form = get_form_by_id(db, form_id)
    form.title = data.title.strip()

    db.commit()
    db.refresh(form)

    return form

def delete_form(
    db: Session,
    form_id: int,
) -> None:

    form = get_form_by_id(db, form_id)

    db.delete(form)
    db.commit()

def publish_form(
    db: Session,
    form_id: int,
) -> Form:

    form = get_form_by_id(db, form_id)
    form.status = FormStatus.PUBLISHED

    db.commit()
    db.refresh(form)

    return form

def unpublish_form(
    db: Session,
    form_id: int,
) -> Form:

    form = get_form_by_id(db, form_id)
    form.status = FormStatus.DRAFT

    db.commit()
    db.refresh(form)

    return form