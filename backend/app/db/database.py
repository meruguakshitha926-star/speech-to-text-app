from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

# Always load backend/.env (works even if uvicorn is started from project root)
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        f"DATABASE_URL is not set. Add it to {_env_path}"
    )

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()