from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project
from app.dependencies import get_current_user
from app.schemas import PromptRequest
from app.starter_game import get_starter_game_content
from app.game_file_service import parse_sections, patch_game_file, get_section_summaries
from app.ai_service import call_kimi_api

router = APIRouter()

PROMPT_LIMIT = 12

def get_or_create_project(db: Session, user: User) -> Project:
    project = db.query(Project).filter(Project.user_id == user.id).first()
    if not project:
        project = Project(
            user_id=user.id,
            game_file_content=get_starter_game_content(),
            prompt_count=0
        )
        db.add(project)
        db.commit()
        db.refresh(project)
    return project

@router.get("/project")
def get_project(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = get_or_create_project(db, current_user)
    return {
        "id": project.id,
        "game_file_content": project.game_file_content,
        "prompt_count": project.prompt_count,
        "prompt_limit": PROMPT_LIMIT
    }

@router.post("/prompt")
async def process_prompt(req: PromptRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trimmed_prompt = req.prompt.strip()
    if not trimmed_prompt or len(trimmed_prompt) > 400:
        raise HTTPException(status_code=400, detail="Prompt must be 1-400 characters after trimming")

    project = get_or_create_project(db, current_user)
    
    if project.prompt_count >= PROMPT_LIMIT:
        raise HTTPException(status_code=403, detail="Prompt limit reached")
        
    # Increment prompt count early in case AI fails, or we can choose to increment only on success.
    # The requirement says "Every actual AI request counts.. Retries/regenerations count too".
    # We will increment before making the external call.
    project.prompt_count += 1
    db.commit()
    
    # 1. Parse sections to get summaries
    sections = parse_sections(project.game_file_content)
    summaries = get_section_summaries(sections)
    
    # 2. Call Kimi AI
    try:
        response_json = await call_kimi_api(trimmed_prompt, project.game_file_content, summaries, sections)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
        
    # 3. Validate JSON structure (very basically)
    if "updates" not in response_json and "new_sections" not in response_json:
        raise HTTPException(status_code=500, detail="Invalid AI response format")
        
    updates = response_json.get("updates", [])
    new_sections = response_json.get("new_sections", [])
    
    # Optional constraint: limit new sections
    if len(new_sections) > 1:
        new_sections = new_sections[:1] # Cap at 1 new section
        
    # 4. Patch game file
    patched_content = patch_game_file(project.game_file_content, updates, new_sections)
    
    # 5. Save updated file back to DB
    project.game_file_content = patched_content
    db.commit()
    
    return {
        "game_file_content": patched_content,
        "prompt_count": project.prompt_count,
        "summary": response_json.get("summary_for_user", "Updated game logic")
    }
