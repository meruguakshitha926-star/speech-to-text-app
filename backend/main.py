from fastapi import Depends, FastAPI, File, Query, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from pydub.utils import make_chunks
from sqlalchemy.orm import Session
import os
import uuid
import json
import asyncio
import websockets

from app.core.deps import get_db, get_optional_user
from app.db.database import Base, engine
from app.models.transcript import Transcript  # noqa: F401
from app.models.user import User  # noqa: F401
from app.routers import auth, transcripts
from app.services.transcript_store import save_transcript
from services.audio_utils import convert_to_wav
from services.stt_service import (
    API_KEY,
    SUPPORTED_LANGUAGES,
    build_live_stream_query,
    transcribe_audio,
)

app = FastAPI(title="Speech-to-Text API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transcripts.router)


@app.on_event("startup")
def create_db_tables():
    Base.metadata.create_all(bind=engine)


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {"message": "Speech-to-Text API Running"}


@app.get("/languages")
def list_languages():
    return [{"code": code, "name": name} for code, name in SUPPORTED_LANGUAGES.items()]


def _transcribe_file_path(path: str, language: str | None) -> dict:
    wav_path = path + ".wav"
    convert_to_wav(path, wav_path)
    result = transcribe_audio(wav_path, language=language)
    os.remove(wav_path)
    return result


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    duration_seconds: int | None = Query(None),
    language: str | None = Query("auto"),
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    try:
        allowed_extensions = [".wav", ".mp3", ".m4a", ".webm"]
        ext = os.path.splitext(file.filename or "")[1].lower()

        if ext not in allowed_extensions:
            return {"status": "error", "message": "Unsupported audio format"}

        lang = (language or "auto").lower()
        if lang not in SUPPORTED_LANGUAGES:
            return {"status": "error", "message": f"Unsupported language: {language}"}

        contents = await file.read()
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        original_path = os.path.join(UPLOAD_FOLDER, unique_filename)

        with open(original_path, "wb") as f:
            f.write(contents)

        max_size = 10 * 1024 * 1024
        transcript_text = ""
        detected_language = None

        if len(contents) > max_size:
            audio = AudioSegment.from_file(original_path)
            chunk_length_ms = 60000
            chunks = make_chunks(audio, chunk_length_ms)
            parts = []
            for i, chunk in enumerate(chunks):
                chunk_name = f"{original_path}_chunk{i}.wav"
                chunk = chunk.set_frame_rate(16000).set_channels(1)
                chunk.export(chunk_name, format="wav")
                result = transcribe_audio(chunk_name, language=lang)
                if result["transcript"]:
                    parts.append(result["transcript"])
                if result.get("language"):
                    detected_language = result["language"]
                os.remove(chunk_name)
            transcript_text = " ".join(parts)
            if os.path.exists(original_path):
                os.remove(original_path)
        else:
            result = _transcribe_file_path(original_path, lang)
            transcript_text = result["transcript"]
            detected_language = result.get("language")
            if os.path.exists(original_path):
                os.remove(original_path)

        saved = None
        if current_user and transcript_text:
            saved = save_transcript(
                db,
                transcript_text,
                user_id=current_user.id,
                filename=file.filename,
                language=detected_language or (lang if lang not in ("auto", "multi") else None),
                duration_seconds=duration_seconds,
            )

        return {
            "status": "ok",
            "transcript": transcript_text,
            "language": detected_language or lang,
            "transcript_id": saved.id if saved else None,
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {"status": "error", "message": str(e)}


@app.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    lang = websocket.query_params.get("language", "auto").lower()
    if lang not in SUPPORTED_LANGUAGES:
        lang = "auto"

    query = build_live_stream_query(lang)
    dg_url = f"wss://api.deepgram.com/v1/listen?{query}"
    headers = {"Authorization": f"Token {API_KEY}"}

    try:
        async with websockets.connect(dg_url, additional_headers=headers) as dg_ws:
            print(f"Connected to Deepgram Live (language={lang})")

            async def receive_from_dg():
                async for message in dg_ws:
                    try:
                        data = json.loads(message)
                        is_final = data.get("is_final", False)
                        channel = data.get("channel", {})
                        alternatives = channel.get("alternatives", [])
                        if alternatives:
                            transcript = alternatives[0].get("transcript", "")
                            if transcript:
                                await websocket.send_json(
                                    {
                                        "transcript": transcript,
                                        "is_final": is_final,
                                        "language": data.get("language") or lang,
                                    }
                                )
                    except Exception as e:
                        print("Parse error in Deepgram message:", e)

            receive_task = asyncio.create_task(receive_from_dg())

            try:
                while True:
                    data = await websocket.receive_bytes()
                    await dg_ws.send(data)
            except WebSocketDisconnect:
                finalize_msg = json.dumps({"type": "CloseStream"})
                await dg_ws.send(finalize_msg)
            finally:
                receive_task.cancel()
    except Exception as e:
        print("Deepgram WebSocket Error:", e)
        try:
            await websocket.close()
        except Exception:
            pass
