import re
from fastapi import HTTPException, status
from app.models.question import Question, QuestionType


EMAIL_PATTERN = re.compile(
    r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
)


def validate_answer(
    question: Question,
    value: str,
) -> str:

    value = value.strip()

    if question.required and not value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Question '{question.title}' "
                "is required"
            ),
        )

    if not value:
        return value

    if question.type == QuestionType.SHORT_TEXT:
        if len(value) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "cannot exceed 500 characters"
                ),
            )

    elif question.type == QuestionType.LONG_TEXT:
        if len(value) > 5000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "cannot exceed 5000 characters"
                ),
            )

    elif question.type == QuestionType.EMAIL:

        if not EMAIL_PATTERN.match(value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "must be a valid email address"
                ),
            )

    elif question.type == QuestionType.NUMBER:

        try:
            float(value)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "must be a valid number"
                ),
            )

    elif question.type == QuestionType.YES_NO:

        normalized = value.lower()

        if normalized not in {"yes", "no"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "must be either yes or no"
                ),
            )

        value = normalized

    elif question.type == QuestionType.RATING:

        try:
            rating = int(value)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "must be a valid rating"
                ),
            )

        if rating < 1 or rating > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Answer to '{question.title}' "
                    "must be between 1 and 5"
                ),
            )

    elif question.type in {
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.DROPDOWN,
    }:

        valid_options = {
            option.label
            for option in question.options
        }

        if value not in valid_options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid option for "
                    f"'{question.title}'"
                ),
            )

    return value