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

Speech-to-Text App — Day 4

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
