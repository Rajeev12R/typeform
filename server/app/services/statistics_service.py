from collections import Counter
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.models.form import Form
from app.models.question import Question
from app.models.response import Answer, Response
from app.schemas.response import (FormStatistics, StatisticsItem)


def get_statistics(
    db: Session,
    form_id: int,
) -> FormStatistics:

    form = db.scalars(
        select(Form)
        .where(Form.id == form_id)
        .options(
            selectinload(Form.questions).selectinload(
                Question.options
            ),
            selectinload(Form.responses).selectinload(
                Response.answers
            ),
        )
    ).unique().first()

    if not form:
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form not found",
        )

    statistics = []

    for question in form.questions:
        values = []
        for response in form.responses:

            for answer in response.answers:

                if answer.question_id == question.id:
                    values.append(answer.value)

        distribution = dict(
            Counter(values)
        )

        statistics.append(
            StatisticsItem(
                question_id=question.id,
                question_title=question.title,
                question_type=question.type,
                total_answers=len(values),
                distribution=distribution,
            )
        )

    return FormStatistics(
        form_id=form.id,
        total_responses=len(form.responses),
        questions=statistics,
    )