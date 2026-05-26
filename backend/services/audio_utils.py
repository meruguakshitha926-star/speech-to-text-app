import os
from pydub import AudioSegment

# Explicitly set the path for ffmpeg to the known working version
AudioSegment.converter = r"C:\ffmpeg-2026-05-21-git-0857141823-full_build\ffmpeg-2026-05-21-git-0857141823-full_build\bin\ffmpeg.exe"
AudioSegment.ffprobe = r"C:\ffmpeg-2026-05-21-git-0857141823-full_build\ffmpeg-2026-05-21-git-0857141823-full_build\bin\ffprobe.exe"

def convert_to_wav(input_path, output_path):
    audio = AudioSegment.from_file(input_path)
    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")