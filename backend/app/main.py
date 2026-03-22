from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, ide

# Create database tables.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Prompting Challenge API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

app.include_router(ide.router, prefix="/ide", tags=["ide"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Prompting Challenge API"}
