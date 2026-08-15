from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user
from app.services.auth_service import create_session, destroy_session

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"],
)

class LoginRequest(BaseModel):
    email: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

@router.post("/login", response_model=UserResponse)
def login(login_data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please use - user@gmail.com",
        )
        
    session_id = create_session(user.id)
    
    response.set_cookie(
        key="session",
        value=session_id,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    
    return user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("session")
    return {"message": "Logged out successfully"}
