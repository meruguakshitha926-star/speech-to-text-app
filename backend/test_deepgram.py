from pathlib import Path
import os
from deepgram import DeepgramClient, PrerecordedOptions

# Load API key
load_dotenv = __import__('dotenv').load_dotenv
load_dotenv(Path(__file__).parent / ".env")
API_KEY = os.getenv("DEEPGRAM_API_KEY")

print("Testing Deepgram API...")
print("API Key available:", bool(API_KEY))

# Test file
test_file = Path(__file__).parent / "uploads" / "Recording (2).m4a"
print("\nTesting with file:", test_file)
print("File exists:", test_file.exists())
print("File size:", test_file.stat().st_size, "bytes")

if not test_file.exists():
    print("Test file not found!")
    exit(1)

try:
    deepgram = DeepgramClient(API_KEY)

    with open(test_file, "rb") as audio:
        buffer_data = audio.read()

    payload = {"buffer": buffer_data}

    # Test 1: English with Nova-3
    print("\n--- Test 1: English (Nova-3) ---")
    options_en = PrerecordedOptions(
        model="nova-3",
        smart_format=True,
        punctuate=True,
        language="en",
    )
    response_en = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options_en)
    print("Response:", response_en)
    transcript_en = response_en.results.channels[0].alternatives[0].transcript
    print("Transcript:", transcript_en)

    # Test 2: Hindi with Whisper
    print("\n--- Test 2: Hindi (Whisper) ---")
    options_hi = PrerecordedOptions(
        model="whisper",
        smart_format=True,
        punctuate=True,
        language="hi",
    )
    response_hi = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options_hi)
    print("Response:", response_hi)
    transcript_hi = response_hi.results.channels[0].alternatives[0].transcript
    print("Transcript:", transcript_hi)

    # Test 3: Telugu with Whisper
    print("\n--- Test 3: Telugu (Whisper) ---")
    options_te = PrerecordedOptions(
        model="whisper",
        smart_format=True,
        punctuate=True,
        language="te",
    )
    response_te = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options_te)
    print("Response:", response_te)
    transcript_te = response_te.results.channels[0].alternatives[0].transcript
    print("Transcript:", transcript_te)

except Exception as e:
    print("\nERROR:", type(e).__name__)
    print("Message:", str(e))
    import traceback
    print("\nStack trace:")
    print(traceback.format_exc())