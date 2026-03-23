from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.database import engine, Base, get_db
from app.models import User, Project
from app.routes import auth, ide, public

# Create database tables.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Prompting Challenge API", debug=True)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://loop-lab-green.vercel.app",
        "http://localhost:3000"], # For MVP, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

app.include_router(ide.router, prefix="/ide", tags=["ide"])

app.include_router(public.router, prefix="/public", tags=["public"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Prompting Challenge API"}

@app.get("/stats", tags=["admin"])
def get_stats(db: Session = Depends(get_db)):
    users_count = db.query(User).count()
    total_prompts = db.query(func.sum(Project.prompt_count)).scalar() or 0
    projects = db.query(Project.game_file_content).all()
    
    lines_of_code = sum(len(str(p.game_file_content).splitlines()) for p in projects if p.game_file_content)
    
    return {
        "users": users_count,
        "prompts": total_prompts,
        "lines_of_code": lines_of_code
    }
