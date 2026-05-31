from pathlib import Path
from typing import Optional
import os

from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

API_KEY = os.getenv("DEEPGRAM_API_KEY")

# Supported languages
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
}


def _build_prerecorded_options(language: Optional[str] = None) -> PrerecordedOptions:
    lang = (language or "en").strip().lower()  # Default to English

    # Use Nova-3 for all languages (has improved support for Telugu, Hindi, etc.)
    return PrerecordedOptions(
        model="nova-3",
        smart_format=True,
        punctuate=True,
        language=lang,
    )


def build_live_stream_query(language: Optional[str] = None) -> str:
    """Query string params for Deepgram live WebSocket (without leading ?)."""

    lang = (language or "en").strip().lower()  # Default to English

    params = [
        "model=nova-3",  # Use Nova-3 for live streaming
        "smart_format=true",
        "interim_results=true",
        "punctuate=true",
        f"language={lang}",
    ]

    return "&".join(params)


def transcribe_audio(file_path: str, language: Optional[str] = None) -> dict:
    print("\n=== Starting transcription ===")
    print("1. File path:", file_path)
    print("2. Language parameter:", language)
    print("3. API Key exists:", bool(API_KEY))

    try:
        # Check if file exists and is readable
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")
        
        file_size = os.path.getsize(file_path)
        print(f"4. File size: {file_size} bytes")
        if file_size == 0:
            raise ValueError("Audio file is empty")

        deepgram = DeepgramClient(API_KEY)

        with open(file_path, "rb") as audio:
            buffer_data = audio.read()

        print("5. Audio file read successfully")

        payload = {"buffer": buffer_data}
        options = _build_prerecorded_options(language)
        
        print("6. Transcription options:", options)
        print("7. Sending request to Deepgram...")

        response = deepgram.listen.prerecorded.v("1").transcribe_file(
            payload,
            options,
        )

        print("8. Deepgram responded successfully")
        print("9. Full response type:", type(response))
        print("10. Response contents:", response)

        # Extract transcript safely
        if not hasattr(response, "results"):
            raise ValueError("Deepgram response has no 'results' attribute")
        
        if not hasattr(response.results, "channels") or not response.results.channels:
            raise ValueError("Deepgram response has no channels")
        
        channel = response.results.channels[0]
        
        if not hasattr(channel, "alternatives") or not channel.alternatives:
            raise ValueError("Deepgram channel has no alternatives")
        
        transcript = channel.alternatives[0].transcript or ""
        print("11. Extracted transcript:", transcript)

        lang_out = language or "en"

        return {
            "transcript": transcript,
            "language": lang_out,
        }
    except Exception as e:
        print("\n=== ERROR IN TRANSCRIBE_AUDIO ===")
        print("Error type:", type(e).__name__)
        print("Error message:", str(e))
        import traceback
        print("Stack trace:\n", traceback.format_exc())
        raise