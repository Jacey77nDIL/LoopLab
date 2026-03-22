from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

# IDE Schemas
class PromptRequest(BaseModel):
    prompt: str = Field(..., max_length=400)
