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
    print(f"_transcribe_file_path called with path: {path}, language: {language}")
    # Try to use original file directly (no conversion needed for Deepgram)
    return transcribe_audio(path, language=language)


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    duration_seconds: int | None = Query(None),
    language: str | None = Query("en"),  # Default to English now
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_user),
):
    original_path = None
    try:
        print(f"=== Transcribe endpoint called ===")
        print(f"Received language parameter: {language}")
        
        allowed_extensions = [".wav", ".mp3", ".m4a", ".webm", ".ogg"]
        ext = os.path.splitext(file.filename or "")[1].lower()

        if ext not in allowed_extensions:
            return {"status": "error", "message": "Unsupported audio format"}

        lang = (language or "en").lower()  # Default to English
        print(f"Using language: {lang}")
        
        if lang not in SUPPORTED_LANGUAGES:
            print(f"Unsupported language: {lang} (SUPPORTED_LANGUAGES: {list(SUPPORTED_LANGUAGES.keys())})")
            return {"status": "error", "message": f"Unsupported language: {language}"}

        contents = await file.read()
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        original_path = os.path.join(UPLOAD_FOLDER, unique_filename)

        with open(original_path, "wb") as f:
            f.write(contents)
        
        print(f"Saved uploaded file to: {original_path}, size: {len(contents)} bytes")

        max_size = 10 * 1024 * 1024
        transcript_text = ""
        detected_language = None

        if len(contents) > max_size:
            print("File is large, splitting into chunks")
            audio = AudioSegment.from_file(original_path)
            chunk_length_ms = 60000
            chunks = make_chunks(audio, chunk_length_ms)
            parts = []
            for i, chunk in enumerate(chunks):
                chunk_name = f"{original_path}_chunk{i}.wav"
                try:
                    chunk = chunk.set_frame_rate(16000).set_channels(1)
                    chunk.export(chunk_name, format="wav")
                    result = transcribe_audio(chunk_name, language=lang)
                    if result["transcript"]:
                        parts.append(result["transcript"])
                    if result.get("language"):
                        detected_language = result["language"]
                finally:
                    if os.path.exists(chunk_name):
                        os.remove(chunk_name)
            transcript_text = " ".join(parts)
        else:
            print("Processing file normally")
            result = _transcribe_file_path(original_path, lang)
            transcript_text = result["transcript"]
            detected_language = result.get("language")

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
        import traceback
        print("Stack trace:", traceback.format_exc())
        return {"status": "error", "message": str(e)}
    finally:
        if original_path and os.path.exists(original_path):
            try:
                os.remove(original_path)
                print(f"Cleaned up uploaded file: {original_path}")
            except Exception as cleanup_error:
                print(f"Error cleaning up file: {cleanup_error}")


@app.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    lang = websocket.query_params.get("language", "en").lower()  # Default to English
    if lang not in SUPPORTED_LANGUAGES:
        lang = "en"  # Fallback to English if invalid

    query = build_live_stream_query(lang)
    dg_url = f"wss://api.deepgram.com/v1/listen?{query}"
    headers = {"Authorization": f"Token {API_KEY}"}

    print(f"WebSocket connection requested (language={lang})")
    print(f"Deepgram URL: {dg_url}")

    try:
        async with websockets.connect(dg_url, additional_headers=headers) as dg_ws:
            print(f"Connected to Deepgram Live (language={lang})")

            async def receive_from_dg():
                try:
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
                        except json.JSONDecodeError as e:
                            print("Parse error in Deepgram message:", e)
                        except Exception as e:
                            print("Error processing Deepgram message:", e)
                except Exception as e:
                    print("Error in receive_from_dg:", e)

            receive_task = asyncio.create_task(receive_from_dg())

            try:
                while True:
                    data = await websocket.receive_bytes()
                    await dg_ws.send(data)
            except WebSocketDisconnect:
                print("Client disconnected")
                try:
                    finalize_msg = json.dumps({"type": "CloseStream"})
                    await dg_ws.send(finalize_msg)
                except Exception as e:
                    print("Error sending CloseStream to Deepgram:", e)
            except Exception as e:
                print("Error receiving from client:", e)
            finally:
                receive_task.cancel()
                try:
                    await receive_task
                except asyncio.CancelledError:
                    pass
    except websockets.exceptions.InvalidURI as e:
        print(f"Invalid Deepgram URI: {e}")
        await websocket.close(code=1002, reason="Invalid Deepgram configuration")
    except websockets.exceptions.WebSocketException as e:
        print(f"Deepgram WebSocket connection failed: {e}")
        await websocket.close(code=1002, reason="Failed to connect to Deepgram")
    except Exception as e:
        print(f"Unexpected error in WebSocket endpoint: {e}")
        try:
            await websocket.close(code=1011, reason="Internal server error")
        except Exception:
            pass
