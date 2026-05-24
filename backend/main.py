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