from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.form import Form, FormStatus
from app.models.question import Question
from app.models.response import Answer, Response
from app.schemas.response import ResponseCreate
from app.services.validation_service import validate_answer


def get_published_form(
    db: Session,
    public_id: str,
) -> Form:

    statement = (
        select(Form)
        .where(
            Form.public_id == public_id,
            Form.status == FormStatus.PUBLISHED,
        )
        .options(
            selectinload(Form.questions).selectinload(
                Question.options
            )
        )
    )

    form = db.scalars(statement).unique().first()

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Published form not found",
        )

    return form


def get_public_form(
    db: Session,
    public_id: str,
) -> Form:

    return get_published_form(
        db,
        public_id,
    )


def submit_response(
    db: Session,
    public_id: str,
    data: ResponseCreate,
) -> Response:

    form = get_published_form(
        db,
        public_id,
    )
    questions_by_id = {
        question.id: question
        for question in form.questions
    }
    submitted_answers = {
        answer.question_id: answer.value
        for answer in data.answers
    }

    for question_id in submitted_answers:
        if question_id not in questions_by_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Question {question_id} "
                    "does not belong to this form"
                ),
            )

    for question in form.questions:
        if (
            question.required
            and question.id not in submitted_answers
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Question '{question.title}' "
                    "is required"
                ),
            )

    validated_answers = []

    for question_id, raw_value in submitted_answers.items():
        question = questions_by_id[question_id]
        validated_value = validate_answer(
            question,
            raw_value,
        )
        validated_answers.append(
            (
                question_id,
                validated_value,
            )
        )

    response = Response(
        form_id=form.id,
    )

    db.add(response)
    db.flush()

    for question_id, value in validated_answers:

        answer = Answer(
            response_id=response.id,
            question_id=question_id,
            value=value,
        )

        db.add(answer)

    db.commit()

    db.refresh(response)

    return response

def get_responses(
    db: Session,
    form_id: int,
) -> list[Response]:

    statement = (
        select(Response)
        .where(Response.form_id == form_id)
        .options(
            selectinload(Response.answers)
        )
        .order_by(Response.submitted_at.desc())
    )

    return list(
        db.scalars(statement).unique().all()
    )

def get_response(
    db: Session,
    form_id: int,
    response_id: int,
) -> Response:

    statement = (
        select(Response)
        .where(
            Response.id == response_id,
            Response.form_id == form_id,
        )
        .options(
            selectinload(Response.answers)
        )
    )

    response = db.scalars(
        statement
    ).unique().first()

    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found",
        )

    return response