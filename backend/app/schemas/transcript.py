from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TranscriptCreate(BaseModel):
    text: str
    filename: Optional[str] = None
    language: Optional[str] = None
    duration_seconds: Optional[int] = None


class TranscriptResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    text: str
    filename: Optional[str] = None
    language: Optional[str] = None
    duration_seconds: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TranscriptListItem(BaseModel):
    id: int
    filename: Optional[str] = None
    language: Optional[str] = None
    duration_seconds: Optional[int] = None
    created_at: datetime
    preview: str

    class Config:
        from_attributes = True
