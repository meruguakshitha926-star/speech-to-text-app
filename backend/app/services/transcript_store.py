from typing import Optional

from sqlalchemy.orm import Session

from app.models.transcript import Transcript


def save_transcript(
    db: Session,
    text: str,
    *,
    user_id: Optional[int] = None,
    filename: Optional[str] = None,
    language: Optional[str] = None,
    duration_seconds: Optional[int] = None,
) -> Transcript:
    row = Transcript(
        text=text,
        user_id=user_id,
        filename=filename,
        language=language,
        duration_seconds=duration_seconds,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
