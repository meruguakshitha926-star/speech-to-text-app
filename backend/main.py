from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import os
import uuid
import shutil

from services.audio_utils import convert_to_wav
from services.stt_service import transcribe_audio

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def home():
    return {"message": "Speech-to-Text API Running"}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    try:

        # Allowed audio formats
        allowed_extensions = [
            ".wav",
            ".mp3",
            ".m4a",
            ".webm"
        ]

        # Get file extension
        ext = os.path.splitext(
            file.filename
        )[1].lower()

        # Validate format
        if ext not in allowed_extensions:
            return {
                "status": "error",
                "message":
                "Unsupported audio format"
            }

        # Read file contents
        contents = await file.read()

        # File size limit = 10MB
        max_size = 10 * 1024 * 1024

        if len(contents) > max_size:
            return {
                "status": "error",
                "message":
                "File too large"
            }

        # Unique filename
        unique_filename = (
            f"{uuid.uuid4()}_{file.filename}"
        )

        # Save original file
        original_path = os.path.join(
            UPLOAD_FOLDER,
            unique_filename
        )

        with open(original_path, "wb") as f:
            f.write(contents)

        # WAV output path
        wav_path = original_path + ".wav"

        # Convert audio
        convert_to_wav(
            original_path,
            wav_path
        )

        # Transcribe audio
        transcript = transcribe_audio(
            wav_path
        )

        # Cleanup
        os.remove(original_path)
        os.remove(wav_path)

        return {
            "status": "ok",
            "transcript": transcript
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "status": "error",
            "message": str(e)
        }

    # Unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Original uploaded file path
    original_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    # Save uploaded file
    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # WAV converted file path
    wav_path = original_path + ".wav"

    # Convert audio
    convert_to_wav(original_path, wav_path)

    # Send to DeepInfra STT
    transcript = transcribe_audio(wav_path)

    # Optional cleanup
    os.remove(original_path)
    os.remove(wav_path)

    return {
        "status": "ok",
        "filename": file.filename,
        "transcript": transcript
    }