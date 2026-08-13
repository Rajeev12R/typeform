from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.config import DEFAULT_CREATOR_ID
from app.models.form import Form
from app.models.question import (Question,QuestionOption,QuestionType)
from app.schemas.question import (QuestionCreate,QuestionUpdate)

OPTION_QUESTION_TYPES = {
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.DROPDOWN,
}

def get_form(
    db: Session,
    form_id: int,
) -> Form:

    statement = select(Form).where(
        Form.id == form_id,
        Form.user_id == DEFAULT_CREATOR_ID,
    )

    form = db.scalar(statement)

    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )

    return form


def get_question(
    db: Session,
    question_id: int,
) -> Question:

    statement = (
        select(Question)
        .join(Form, Question.form_id == Form.id)
        .where(Question.id == question_id, Form.user_id == DEFAULT_CREATOR_ID)
        .options(
            selectinload(Question.options)
        )
    )
    question = db.scalars(statement).first()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    return question

def validate_question_data(
    question_type: QuestionType,
    options,
) -> None:

    requires_options = (
        question_type in OPTION_QUESTION_TYPES
    )

    if requires_options and not options:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"{question_type.value} questions "
                "must have at least one option"
            ),
        )

    if not requires_options and options:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"{question_type.value} questions "
                "cannot have options"
            ),
        )

def create_question(
    db: Session,
    form_id: int,
    data: QuestionCreate,
) -> Question:

    form = get_form(db, form_id)

    validate_question_data(
        data.type,
        data.options,
    )
    max_order = db.scalar(
        select(Question.order)
        .where(Question.form_id == form.id)
        .order_by(Question.order.desc())
        .limit(1)
    )
    next_order = (
        max_order + 1
        if max_order is not None
        else 1
    )
    question = Question(
        form_id=form.id,
        type=data.type,
        title=data.title.strip(),
        description=(
            data.description.strip()
            if data.description
            else None
        ),
        required=data.required,
        order=next_order,
    )

    db.add(question)
    db.flush()

    for index, option in enumerate(
        data.options,
        start=1,
    ):
        question_option = QuestionOption(
            question_id=question.id,
            label=option.label.strip(),
            order=index,
        )

        db.add(question_option)

    db.commit()
    db.refresh(question)
    return get_question(
        db,
        question.id,
    )

def update_question(
    db: Session,
    question_id: int,
    data: QuestionUpdate,
) -> Question:

    question = get_question(
        db,
        question_id,
    )
    new_type = (
        data.type
        if data.type is not None
        else question.type
    )
    new_options = (
        data.options
        if data.options is not None
        else question.options
    )
    validate_question_data(
        new_type,
        new_options,
    )
    if data.type is not None:
        question.type = data.type

    if data.title is not None:
        question.title = data.title.strip()

    if data.description is not None:
        question.description = (
            data.description.strip()
            or None
        )

    if data.required is not None:
        question.required = data.required

    if data.options is not None:

        question.options.clear()

        for index, option in enumerate(
            data.options,
            start=1,
        ):
            question.options.append(
                QuestionOption(
                    label=option.label.strip(),
                    order=index,
                )
            )

    db.commit()

    return get_question(
        db,
        question.id,
    )

def delete_question(
    db: Session,
    question_id: int,
) -> None:

    question = get_question(
        db,
        question_id,
    )

    form_id = question.form_id

    db.delete(question)
    db.flush()

    remaining_questions = db.scalars(
        select(Question)
        .where(Question.form_id == form_id)
        .order_by(Question.order)
    ).all()

    for index, remaining_question in enumerate(
        remaining_questions,
        start=1,
    ):
        remaining_question.order = index

    db.commit()

def reorder_questions(
    db: Session,
    form_id: int,
    question_ids: list[int],
) -> list[Question]:

    get_form(db, form_id)

    questions = db.scalars(
        select(Question)
        .where(Question.form_id == form_id)
    ).all()

    existing_ids = {
        question.id
        for question in questions
    }

    submitted_ids = set(question_ids)

    if existing_ids != submitted_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Question IDs must contain every "
                "question belonging to the form "
                "exactly once"
            ),
        )

    question_map = {
        question.id: question
        for question in questions
    }

    for index, question_id in enumerate(
        question_ids,
        start=1,
    ):
        question_map[question_id].order = index

    db.commit()

    return list(
        db.scalars(
            select(Question)
            .where(Question.form_id == form_id)
            .options(
                selectinload(Question.options)
            )
            .order_by(Question.order)
        ).all()
    )