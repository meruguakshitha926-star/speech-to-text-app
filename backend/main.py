from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
import json
import asyncio
import websockets

from pydub import AudioSegment
from pydub.utils import make_chunks

from services.audio_utils import convert_to_wav
from services.stt_service import transcribe_audio, API_KEY

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
        ext = os.path.splitext(file.filename)[1].lower()

        # Validate format
        if ext not in allowed_extensions:
            return {
                "status": "error",
                "message": "Unsupported audio format"
            }

        # Read file contents
        contents = await file.read()

        # Unique filename
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        original_path = os.path.join(UPLOAD_FOLDER, unique_filename)

        with open(original_path, "wb") as f:
            f.write(contents)

        # File size limit check
        max_size = 10 * 1024 * 1024  # 10MB

        if len(contents) > max_size:
            # Chunking strategy for large files
            print("File is large. Using chunking strategy...")
            audio = AudioSegment.from_file(original_path)
            chunk_length_ms = 60000  # 60 seconds
            chunks = make_chunks(audio, chunk_length_ms)
            
            full_transcript = []
            
            for i, chunk in enumerate(chunks):
                chunk_name = f"{original_path}_chunk{i}.wav"
                # Convert chunk to 16k mono WAV
                chunk = chunk.set_frame_rate(16000).set_channels(1)
                chunk.export(chunk_name, format="wav")
                
                # Transcribe
                transcript_part = transcribe_audio(chunk_name)
                if transcript_part:
                    full_transcript.append(transcript_part)
                
                # Cleanup
                os.remove(chunk_name)
            
            os.remove(original_path)
            
            return {
                "status": "ok",
                "transcript": " ".join(full_transcript)
            }
        else:
            # WAV output path
            wav_path = original_path + ".wav"

            # Convert audio
            convert_to_wav(original_path, wav_path)

            # Transcribe audio
            transcript = transcribe_audio(wav_path)

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

@app.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Connect directly to Deepgram WebSockets with interim results
    dg_url = "wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true &encoding=opus"
    
    headers = {
        "Authorization": f"Token {API_KEY}"
    }

    try:
        async with websockets.connect(dg_url, extra_headers=headers) as dg_ws:
            print("Connected to Deepgram Live!")
            
            # Sub-task to receive transcripts from Deepgram and send to frontend
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
                                print("Partial transcript:", transcript)
                                await websocket.send_json({
                                    "transcript": transcript, 
                                    "is_final": is_final
                                })
                    except Exception as e:
                        print("Parse error in Deepgram message:", e)

            receive_task = asyncio.create_task(receive_from_dg())
            
            try:
                while True:
                    print("Receiving chunk from frontend...")

                    # Receive audio chunk bytes from client frontend
                    data = await websocket.receive_bytes()
                    
                    # Forward straight to Deepgram socket
                    await dg_ws.send(data)
                    
            except WebSocketDisconnect:
                print("Client disconnected.")
                # Send terminal message to Deepgram to close stream properly
                finalize_msg = json.dumps({"type": "CloseStream"})
                await dg_ws.send(finalize_msg)
            finally:
                receive_task.cancel()
    except Exception as e:
        print("Deepgram WebSocket Error:", e)
        try:
            await websocket.close()
        except:
            pass