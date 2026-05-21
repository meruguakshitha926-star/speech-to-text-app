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