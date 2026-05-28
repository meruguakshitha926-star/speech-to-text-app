from pathlib import Path
from typing import Optional

from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv
import os

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

API_KEY = os.getenv("DEEPGRAM_API_KEY")

# "auto" = detect language; "multi" = multilingual code-switching
SUPPORTED_LANGUAGES = {
    "auto": "Auto-detect",
    "multi": "Multilingual (mixed)",
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "pt": "Portuguese",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
}


def _build_prerecorded_options(language: Optional[str] = None) -> PrerecordedOptions:
    lang = (language or "auto").strip().lower()

    if lang == "auto":
        return PrerecordedOptions(
            model="nova-2",
            smart_format=True,
            punctuate=True,
            detect_language=True,
        )
    if lang == "multi":
        return PrerecordedOptions(
            model="nova-2",
            smart_format=True,
            punctuate=True,
            language="multi",
        )
    return PrerecordedOptions(
        model="nova-2",
        smart_format=True,
        punctuate=True,
        language=lang,
    )


def build_live_stream_query(language: Optional[str] = None) -> str:
    """Query string params for Deepgram live WebSocket (without leading ?)."""
    lang = (language or "auto").strip().lower()
    params = [
        "model=nova-2",
        "smart_format=true",
        "interim_results=true",
        "encoding=opus",
        "punctuate=true",
    ]
    if lang == "auto":
        params.append("detect_language=true")
    elif lang == "multi":
        params.append("language=multi")
    else:
        params.append(f"language={lang}")
    return "&".join(params)


def transcribe_audio(file_path: str, language: Optional[str] = None) -> dict:
    deepgram = DeepgramClient(API_KEY)

    with open(file_path, "rb") as audio:
        buffer_data = audio.read()

    payload = {"buffer": buffer_data}
    options = _build_prerecorded_options(language)

    response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)

    channel = response.results.channels[0]
    transcript = channel.alternatives[0].transcript

    detected = getattr(channel, "detected_language", None)
    if not detected:
        metadata = getattr(response.results, "metadata", None)
        if metadata:
            detected = getattr(metadata, "detected_language", None)

    lang_out = detected or (language if language not in (None, "auto", "multi") else None)

    return {"transcript": transcript or "", "language": lang_out}
