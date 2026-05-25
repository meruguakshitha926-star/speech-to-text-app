from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("DEEPGRAM_API_KEY")

def transcribe_audio(file_path):

    deepgram = DeepgramClient(API_KEY)

    with open(file_path, "rb") as audio:
        buffer_data = audio.read()

    payload = {
        "buffer": buffer_data
    }

    options = PrerecordedOptions(
    model="nova-2",
    smart_format=True,
    detect_language=True,
    punctuate=True


    )

    response = deepgram.listen.prerecorded.v("1").transcribe_file(
        payload,
        options
    )

    transcript = response.results.channels[0].alternatives[0].transcript

    return transcript