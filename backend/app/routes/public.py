from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project

router = APIRouter()

@router.get("/games")
def get_public_games(db: Session = Depends(get_db)):
    # Retrieve all games
    projects = db.query(Project).join(User).all()
    result = []
    for p in projects:
        # Simple heuristic: treat email prefix as username
        username = p.user.email.split("@")[0]
        result.append({
            "user_id": p.user.id,
            "username": username,
            "prompt_count": p.prompt_count
        })
    return result

@router.get("/games/{username}")
def get_public_game_content(username: str, db: Session = Depends(get_db)):
    # Find user by simplistic prefix parsing
    user = db.query(User).filter(User.email.like(f"{username}@%")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Operator not found")
        
    project = db.query(Project).filter(Project.user_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Simulation data not found")
        
    return {
        "username": username,
        "game_file_content": project.game_file_content
    }
