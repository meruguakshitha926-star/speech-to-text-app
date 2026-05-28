from pydantic import BaseModel, field_validator


class UserCreate(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or len(v) < 5:
            raise ValueError("Invalid email")
        return v


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
