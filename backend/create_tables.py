from sqlalchemy import inspect, text

from app.db.database import engine
from app.models.transcript import Transcript  # noqa: F401
from app.models.user import User  # noqa: F401
from app.db.database import Base

Base.metadata.create_all(bind=engine)

inspector = inspect(engine)
if "transcripts" in inspector.get_table_names():
    columns = {c["name"] for c in inspector.get_columns("transcripts")}
    if "user_id" not in columns:
        with engine.connect() as conn:
            conn.execute(
                text("ALTER TABLE transcripts ADD COLUMN user_id INTEGER REFERENCES users(id)")
            )
            conn.commit()
        print("Added user_id column to transcripts")

print("Tables created successfully!")
