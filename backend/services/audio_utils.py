import subprocess

def convert_to_wav(input_path, output_path):
    command = [
        r"C:\ffmpeg-2026-05-21-git-0857141823-full_build\ffmpeg-2026-05-21-git-0857141823-full_build\bin\ffmpeg.exe",
        "-y",
        "-i",
        input_path,
        "-ar",
        "16000",
        "-ac",
        "1",
        output_path
    ]

    subprocess.run(command, check=True)