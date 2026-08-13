from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import (Answer, Form, Question, QuestionOption,Response, User)
from app.routers.forms import router as forms_router
from app.routers.questions import router as questions_router
from app.routers.public import router as public_router
from app.routers.statistics import router as statistics_router
from app.routers.responses import router as response_router
from app.routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Typeform Clone API",
    description="Backend API Typeform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms_router)
app.include_router(questions_router)
app.include_router(public_router)
app.include_router(response_router)
app.include_router(statistics_router)
app.include_router(auth_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "Health API is running"
    }