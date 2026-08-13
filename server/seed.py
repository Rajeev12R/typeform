from sqlalchemy import select
from app.models import (Answer,Form,FormStatus,Question,QuestionOption,QuestionType,Response,User)
from app.database import Base, SessionLocal, engine

def seed_database():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(User).where(
                User.email == "user@gmail.com"
            )
        )
        if existing_user:
            print("Database already seeded.")
            return
        
        creator = User(
            name="User",
            email="user@gmail.com"
        )
        db.add(creator)
        db.flush()

        feedback_form = Form(
            user_id=creator.id,
            title="Customer Feedback",
            status=FormStatus.PUBLISHED,
            public_id="customer-feedback-demo",
        )

        db.add(feedback_form)
        db.flush()

        q1 = Question(
            form_id=feedback_form.id,
            type=QuestionType.SHORT_TEXT,
            title="What's your name?",
            description="Tell us your name.",
            required=True,
            order=1,
        )

        q2 = Question(
            form_id=feedback_form.id,
            type=QuestionType.EMAIL,
            title="What's your email?",
            description="We'll only use this to follow up if needed.",
            required=True,
            order=2,
        )

        q3 = Question(
            form_id=feedback_form.id,
            type=QuestionType.MULTIPLE_CHOICE,
            title="How did you hear about us?",
            required=True,
            order=3,
        )

        q4 = Question(
            form_id=feedback_form.id,
            type=QuestionType.RATING,
            title="How would you rate your experience?",
            required=True,
            order=4,
        )

        db.add_all([q1, q2, q3, q4])
        db.flush()

        options = [
            QuestionOption(
                question_id=q3.id,
                label="Google",
                order=1,
            ),
            QuestionOption(
                question_id=q3.id,
                label="Instagram",
                order=2,
            ),
            QuestionOption(
                question_id=q3.id,
                label="Friend",
                order=3,
            ),
            QuestionOption(
                question_id=q3.id,
                label="Other",
                order=4,
            ),
        ]

        db.add_all(options)

        job_form = Form(
            user_id=creator.id,
            title="Software Engineer Application",
            status=FormStatus.PUBLISHED,
            public_id="software-engineer-demo",
        )

        db.add(job_form)
        db.flush()

        jq1 = Question(
            form_id=job_form.id,
            type=QuestionType.SHORT_TEXT,
            title="What's your full name?",
            required=True,
            order=1,
        )
        jq2 = Question(
            form_id=job_form.id,
            type=QuestionType.EMAIL,
            title="What's your email address?",
            required=True,
            order=2,
        )
        jq3 = Question(
            form_id=job_form.id,
            type=QuestionType.NUMBER,
            title="How many years of experience do you have?",
            required=True,
            order=3,
        )
        jq4 = Question(
            form_id=job_form.id,
            type=QuestionType.YES_NO,
            title="Are you comfortable working remotely?",
            required=True,
            order=4,
        )
        jq5 = Question(
            form_id=job_form.id,
            type=QuestionType.DROPDOWN,
            title="What's your primary technology?",
            required=True,
            order=5,
        )
        db.add_all([jq1, jq2, jq3, jq4, jq5])
        db.flush()

        technology_options = [
            QuestionOption(
                question_id=jq5.id,
                label="JavaScript",
                order=1,
            ),
            QuestionOption(
                question_id=jq5.id,
                label="TypeScript",
                order=2,
            ),
            QuestionOption(
                question_id=jq5.id,
                label="Python",
                order=3,
            ),
            QuestionOption(
                question_id=jq5.id,
                label="Java",
                order=4,
            ),
        ]

        db.add_all(technology_options)
        db.flush()


        response_1 = Response(
            form_id=feedback_form.id,
        )
        response_2 = Response(
            form_id=feedback_form.id,
        )

        db.add_all([response_1, response_2])
        db.flush()

        answers = [
            Answer(
                response_id=response_1.id,
                question_id=q1.id,
                value="Aman",
            ),
            Answer(
                response_id=response_1.id,
                question_id=q2.id,
                value="aman@example.com",
            ),
            Answer(
                response_id=response_1.id,
                question_id=q3.id,
                value="Google",
            ),
            Answer(
                response_id=response_1.id,
                question_id=q4.id,
                value="5",
            ),
            Answer(
                response_id=response_2.id,
                question_id=q1.id,
                value="Priya",
            ),
            Answer(
                response_id=response_2.id,
                question_id=q2.id,
                value="priya@example.com",
            ),
            Answer(
                response_id=response_2.id,
                question_id=q3.id,
                value="Instagram",
            ),
            Answer(
                response_id=response_2.id,
                question_id=q4.id,
                value="4",
            ),
        ]

        db.add_all(answers)
        db.commit()

        print("Database seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
