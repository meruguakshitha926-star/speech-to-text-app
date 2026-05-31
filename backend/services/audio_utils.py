import os
from pydub import AudioSegment

# Explicitly set the path for ffmpeg to the known working version
AudioSegment.converter = r"C:\ffmpeg-2026-05-21-git-0857141823-full_build\ffmpeg-2026-05-21-git-0857141823-full_build\bin\ffmpeg.exe"
AudioSegment.ffprobe = r"C:\ffmpeg-2026-05-21-git-0857141823-full_build\ffmpeg-2026-05-21-git-0857141823-full_build\bin\ffprobe.exe"

def convert_to_wav(input_path, output_path):
    print(f"Attempting to convert audio file: {input_path}")
    try:
        # First try without specifying format
        audio = AudioSegment.from_file(input_path)
    except Exception as e1:
        print(f"First conversion attempt failed: {e1}")
        # Try with explicit format detection for webm
        try:
            audio = AudioSegment.from_file(input_path, format="webm")
        except Exception as e2:
            print(f"Second conversion attempt (webm format) failed: {e2}")
            # Try other common formats
            for fmt in ["ogg", "mp3", "wav"]:
                try:
                    print(f"Trying format: {fmt}")
                    audio = AudioSegment.from_file(input_path, format=fmt)
                    break
                except Exception:
                    continue
            else:
                # If all else fails, raise the original error
                raise Exception(f"Could not read audio file. Error: {e1}") from e1
    
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")
    print(f"Successfully converted to wav: {output_path}")