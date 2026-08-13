from fastapi import FastAPI
from app.database import Base, engine
from app.models import (Answer, Form, Question, QuestionOption,Response, User)
from app.routers.forms import router as forms_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Typeform Clone API",
    description="Backend API Typeform",
    version="1.0.0",
)

app.include_router(forms_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Health API is running"
    }