# Speech-to-Text Application

A full-stack Speech-to-Text web application that converts user speech into live text transcripts and stores transcript history.

---

## Day-wise Progress

# Day 1 — Project Scaffolding & Planning

## What I did today:
- Created project folder structure
- Setup frontend (Next.js)
- Setup backend (FastAPI/Flask)
- Installed dependencies
- Planned project architecture

## Goal:
Build speech-to-text application step by step

---

# Tech Stack

## Frontend
- Next.js
- Tailwind CSS

## Backend
- FastAPI
- SQLAlchemy

## Database
- PostgreSQL

## APIs & Libraries
- DeepInfra Speech-to-Text API
- requests
- pydub

## Deployment
- Frontend → Vercel
- Backend → Render

---

# Project Structure

```txt
speech-to-text-app/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── styles/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
├── README.md
├── .gitignore
├── .env.example
└── LICENSE
```

---

# Features

- Live speech recording
- Real-time speech-to-text conversion
- Transcript history
- Save transcripts
- Search transcripts
- Responsive user interface

---

# Git Branches

## main
Stable production-ready code.

## dev
Development and testing branch.

---

# Frontend Setup

## Install Dependencies

```bash
cd frontend
npm install
```

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# Backend Setup

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Backend Server

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```txt
http://127.0.0.1:8000
```

---

# API Documentation

FastAPI Swagger Docs:

```txt
http://127.0.0.1:8000/docs
```

---

# Wireframes

## Screen 1 — Recorder + Live Transcript

```txt
 ------------------------------------------------
| Navbar                                         |
|------------------------------------------------|
|                🎤 Record Button                |
|                                                |
|  Listening Status: ACTIVE                      |
|                                                |
|  Live Transcript Box                           |
|  -------------------------------------------   |
|  Hello, this is live speech transcription...   |
|  -------------------------------------------   |
|                                                |
|  [Pause]   [Stop]   [Save Transcript]          |
 ------------------------------------------------
```

---

## Screen 2 — Transcript History

```txt
 ------------------------------------------------
| Navbar                                         |
|------------------------------------------------|
| Transcript History                             |
|------------------------------------------------|
| Search Bar                                     |
|------------------------------------------------|
| Transcript #1                                  |
| Date: May 21                                   |
| Preview: Hello everyone...                     |
| [View] [Delete]                                |
|------------------------------------------------|
| Transcript #2                                  |
| Date: May 20                                   |
| Preview: Meeting notes...                      |
 ------------------------------------------------
```

---

# Future Enhancements

- User authentication
- Real-time streaming transcription
- Audio file uploads
- Export transcripts
- AI-generated summaries

---

# Authors

- Akshitha Merugu


# Day 2 — Frontend UI Skeleton, Tailwind & Audio Recording

## What I did today:

### Frontend UI & Tailwind
- Installed and configured Tailwind CSS
- Added Tailwind setup files and global styles
- Created reusable UI components:
  - Header
  - RecorderPanel
  - TranscriptPanel

### Static Pages
- Built main recorder page (`/`)
- Built history page (`/history`)

### Transcript State
- Added React state for transcript placeholder
- Added start/stop recording buttons
- Added empty transcript display area

### Client-side Audio Recording
- Implemented microphone permission request using:
  ```js
  navigator.mediaDevices.getUserMedia({ audio: true })
  ```

- Implemented MediaRecorder API for recording audio
- Captured audio chunks during recording
- Combined chunks into a Blob on stop
- Added recording state indicator
- Added recording timer
- Added audio playback functionality
- Added download recorded audio feature

---

## Deliverables Achieved
- Clickable frontend UI mockup
- Working Start/Stop recording
- Empty transcript area
- Audio Blob generation
- Download and local playback support

---

## Goal
Build frontend UI and implement client-side audio recording functionality using MediaRecorder API.


# Day 3 — FastAPI Backend: Audio Upload Endpoint

## What I did today:

### Backend Setup (FastAPI)
- Created FastAPI application skeleton
- Configured backend server using `uvicorn`
- Installed required dependency: `python-multipart` for file uploads
- Prepared backend for handling frontend audio uploads

---

### CORS Setup
- Enabled CORS to allow frontend communication
- Configured middleware for cross-origin requests

---

### API Endpoint Implementation

#### POST `/transcribe`

- Implemented `/transcribe` endpoint in FastAPI
- Accepts audio file using `UploadFile`
- Receives file via `multipart/form-data`
- Reads uploaded file from request
- Saves file temporarily in `uploads/` folder

---

### File Handling
- Used FastAPI `UploadFile` to handle uploads
- Saved file using binary write mode
- Stored file with original filename for testing

Example logic:
```python
contents = await file.read()
with open(file_path, "wb") as f:
    f.write(contents)

Testing:

Tested API using:
curl command
Postman

Verified:
Audio file uploads successfully
File saved in backend folder (uploads/)
Correct JSON response returned
Deliverables Achieved
FastAPI backend server setup
CORS enabled
/transcribe POST endpoint working
Audio file upload working via multipart form
File successfully saved locally
API tested successfully

 Day 4— FastAPI Backend: Audio Upload Endpoint

## Integrate Speech-to-Text Provider (Proof of Concept)

This project implements a working Speech-to-Text (STT) backend using FastAPI and Deepgram API.  
The application accepts uploaded audio files, converts them into a compatible WAV format, sends them to the STT provider, and returns the generated transcript.

---

# Goals Completed

- Integrated a Speech-to-Text provider (Deepgram)
- Added API key securely using `.env`
- Uploaded audio files through FastAPI
- Converted audio into WAV format using FFmpeg
- Sent audio to STT API
- Returned real transcript text from `/transcribe`

---

# Tech Stack

## Backend
- Python
- FastAPI
- Uvicorn

## Speech-to-Text Provider
- Deepgram API

## Audio Processing
- FFmpeg

## Environment Management
- python-dotenv

---

# Project Structure

```bash
backend/
│
├── main.py
├── .env
├── uploads/
│
├── services/
│   ├── stt_service.py
│   └── audio_utils.py
│
└── requirements.txt
Features Implemented
Audio Upload API

Users can upload:

.wav
.mp3
.m4a

files through the /transcribe endpoint.

Audio Conversion

Uploaded files are converted into:

WAV format
16kHz sample rate
Mono channel

using FFmpeg for better STT compatibility.

Real Speech-to-Text

Audio is sent to Deepgram API and real transcript text is returned.

API Endpoint
POST /transcribe

Uploads an audio file and returns transcript text.

Example API Response
{
  "status": "ok",
  "filename": "voice.mp3.m4a",
  "transcript": "Hello, this is a speech-to-text demo."
}
Environment Variables

Create a .env file inside backend/

DEEPGRAM_API_KEY=your_api_key
Installation
1. Clone Repository
git clone <your_repo_url>
cd speech-to-text-app
2. Create Virtual Environment
python -m venv venv

Activate environment:

Windows
venv\Scripts\activate
3. Install Dependencies
pip install -r requirements.txt
4. Install FFmpeg

Download and install FFmpeg.

Add FFmpeg bin folder to system PATH.

Verify installation:

ffmpeg -version
Run Backend Server
uvicorn main:app --reload

Server runs at:

http://127.0.0.1:8000
Swagger Documentation

Open:

http://127.0.0.1:8000/docs

Upload audio file and test transcription API directly.

Workflow
Upload Audio
      ↓
Save File
      ↓
Convert to WAV
      ↓
Send to Deepgram API
      ↓
Receive Transcript
      ↓
Return JSON Response
Deliverable Status
Requirement	Status
STT Provider Integration	✅ Completed
API Key Configuration	✅ Completed
Audio Upload	✅ Completed
WAV Conversion	✅ Completed
Real Transcript Response	✅ Completed
/transcribe Endpoint	✅ Completed
Sample Output
{
  "status": "ok",
  "filename": "voice.mp3.m4a",
  "transcript": "LCLM move these are working this. So, like, what is LCLM thing? Yes."
}


# 📘 Day 5 — End-to-End Frontend Integration with Improved Audio Handling & STT Compatibility

## 🎤 Speech-to-Text Full Pipeline Integration

This project completes the full **end-to-end Speech-to-Text workflow** by connecting the frontend audio recorder with the FastAPI backend.  
Audio recorded in the browser is uploaded to the backend, processed for STT compatibility, and converted into text using a Speech-to-Text provider.

---

# 🎯 Goals Completed

- Integrated frontend with backend `/transcribe` API
- Converted recorded **audio Blob → File** using `FormData`
- Sent audio using `fetch` API
- Displayed real transcript in UI
- Added loading state during transcription request
- Completed full flow: record → upload → transcribe → display

---

# 🎧 Improve Audio Handling & STT Compatibility

This phase improves audio reliability and ensures compatibility with Speech-to-Text systems.

### ⚙️ Improvements Implemented
- Converted audio to **WAV format**
- Standardized audio to:
  - 16kHz sample rate
  - Mono channel
- Backend audio normalization using FFmpeg / pydub
- Improved compatibility with STT providers (Deepgram / Whisper)

---

# 🧠 Backend Audio Processing

```python
from pydub import AudioSegment

audio = AudioSegment.from_file(path)
audio = audio.set_frame_rate(16000).set_channels(1)
audio.export("processed.wav", format="wav")


🌐 Frontend Upload Implementation
const form = new FormData();
form.append("file", recordedFile, "speech.webm");

const res = await fetch(process.env.NEXT_PUBLIC_API + "/transcribe", {
  method: "POST",
  body: form,
});

const data = await res.json();
setTranscript(data.transcript);
🔄 End-to-End Workflow

Record Audio (Browser)
↓
Convert Blob → File
↓
Send via FormData (Frontend)
↓
FastAPI /transcribe Endpoint
↓
Audio Conversion (WAV, 16kHz, mono)
↓
Speech-to-Text Processing (Deepgram / STT API)
↓
Return Transcript
↓
Display in UI

📦 API Endpoint
POST /transcribe

Request:

file: audio.webm

Response:

{
  "transcript": "Hello, this is the converted speech text."
}


# Day-6: Real-time Streaming / Partial Transcripts (Chunking)

## Overview

This phase introduces real-time audio streaming using WebSockets for lower-latency Speech-to-Text processing.

Instead of waiting until recording completes, the frontend now sends small audio chunks continuously to the backend while recording is in progress. The backend processes these chunks and returns partial/live transcript updates.

This improves responsiveness and creates a more real-time transcription experience.

---

# Features Implemented

## Real-time Audio Streaming

Implemented live audio chunk streaming from frontend to backend using WebSockets.

- Small audio chunks are generated continuously using MediaRecorder.
- Chunks are sent instantly to the FastAPI backend.
- Enables lower latency transcription workflow.

---

## WebSocket Integration

Integrated WebSocket communication between:

- React frontend
- FastAPI backend

This allows bidirectional communication for:

- Sending audio chunks
- Receiving partial transcript updates

---

## Partial Transcript Updates

Implemented live transcript updates while recording is active.

- Backend emits partial transcript responses
- Frontend updates transcript panel dynamically
- Users can see transcript generation in real-time

---

## Chunk-based Audio Processing

Audio is divided into smaller chunks for faster processing.

Benefits:

- Reduced waiting time
- Faster feedback loop
- Improved streaming architecture

---

## Frontend Enhancements

Implemented:

- WebSocket connection handling
- Audio chunk transmission
- Live transcript rendering
- Real-time recording state updates

---

## Backend Enhancements

Implemented:

- FastAPI WebSocket endpoint
- Audio chunk receiving
- Real-time processing flow
- Partial transcript emission to frontend

---

# Technologies Used

## Frontend

- React
- TypeScript
- MediaRecorder API
- WebSocket API

## Backend

- FastAPI
- WebSockets / fastapi-socketio
- Python

---

# Workflow

1. User starts recording
2. MediaRecorder generates small audio chunks
3. Frontend sends chunks via WebSocket
4. Backend receives audio chunks
5. Backend processes/transcribes chunks
6. Partial transcript is emitted back
7. Frontend updates transcript live

---

# Outcome

Successfully implemented a real-time streaming architecture with live partial transcript updates during recording.

This phase improves the responsiveness and scalability of the Speech-to-Text application and simulates real-world streaming transcription systems.


# 🎙️ Speech-to-Text App — Day 7 Progress

---

## 📌 Persist Transcripts & Build History UI

### 🎯 Goal
Save transcripts to database and display them in a history page.

### 🛠️ What I did
- Chose database: **PostgreSQL / Supabase**
- Created transcripts table with schema:
  - id, user_id (nullable), text, created_at, duration_seconds, filename, language
- Built backend APIs:
  - `GET /transcripts`
  - `GET /transcripts/{id}`
- Developed `/history` UI page to list all saved transcripts
- Added open/download functionality for each transcript

### ✅ Result
Transcripts are now stored in the database and visible in the history page.

---

## 🔐 Authentication & Multi-user Support

### 🎯 Goal
Allow users to sign in and store private transcripts.

### 🛠️ What I did
- Implemented authentication using **Supabase Auth / JWT (PyJWT)**
- Attached `user_id` to each transcript
- Secured upload endpoint with authentication
- Protected `/history` route for logged-in users only

### ✅ Result
Each user can now access only their own transcripts.

---

## 🎨 UI Polish & Export Features

### 🎯 Goal
Improve UI and add export options.

### 🛠️ What I did
- Added transcript utilities:
  - Copy transcript
  - Download as `.txt`
  - (Optional) Download as `.docx`
  - Share transcript link
- Improved UI responsiveness and layout
- Added accessibility improvements:
  - aria-labels
  - keyboard navigation support
- Enhanced transcript display with better formatting

### ✅ Result
App is now more user-friendly, responsive, and feature-rich.

---

## 🚀 Final Outcome

- 🎧 Audio upload → transcription working  
- 💾 Transcripts stored in database  
- 📜 History page functional  
- 🔐 Authentication added  
- 📤 Export features implemented  
- 🎨 UI improved and polished  

---