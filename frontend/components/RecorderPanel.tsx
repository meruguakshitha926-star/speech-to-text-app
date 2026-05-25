"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onRecordingComplete: (blob: Blob) => void;
};

export default function RecorderPanel({
  onRecordingComplete,
}: Props) {
  const [isRecording, setIsRecording] =
    useState(false);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [time, setTime] = useState(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const chunksRef = useRef<BlobPart[]>([]);

  const streamRef =
    useRef<MediaStream | null>(null);

  // 🎤 START RECORDING
  const startRecording = async () => {
    try {
      // Ask microphone permission
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      streamRef.current = stream;

      // Create recorder
      let mediaRecorder: MediaRecorder;

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mediaRecorder = new MediaRecorder(
          stream,
          {
            mimeType:
              "audio/webm;codecs=opus",
          }
        );
      } else {
        mediaRecorder = new MediaRecorder(
          stream
        );
      }

      mediaRecorderRef.current =
        mediaRecorder;

      // Reset chunks
      chunksRef.current = [];

      // Save chunks
      mediaRecorder.ondataavailable = (
  event
) => {

  if (event.data.size > 0) {

    console.log(
      "Chunk received:",
      event.data.size
    );

    // Store chunk
    chunksRef.current.push(
      event.data
    );

    // Create temporary chunk blob
    const chunkBlob = new Blob(
      [event.data],
      {
        type: "audio/webm",
      }
    );

    console.log(
      "Chunk Blob:",
      chunkBlob
    );
  }
};

      // When stop recording
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        console.log(
          "Blob Size:",
          audioBlob.size
        );

        // Create playable URL
        const url =
          URL.createObjectURL(audioBlob);

        setAudioUrl(url);

        // Send blob to parent
        onRecordingComplete(audioBlob);
      };

      // Start recording
      mediaRecorder.start(1000);

      setIsRecording(true);

    } catch (error) {
      console.error(
        "Microphone Error:",
        error
      );

      alert(
        "Microphone permission denied."
      );
    }
  };

  // ⏹ STOP RECORDING
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    streamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop()
      );

    setIsRecording(false);
  };

  // 📥 DOWNLOAD AUDIO
  const downloadAudio = () => {
    if (!audioUrl) return;

    const a =
      document.createElement("a");

    a.href = audioUrl;
    a.download = "recording.webm";

    a.click();
  };

  // ⏱ TIMER
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      setTime(0);
    }

    return () =>
      clearInterval(interval);

  }, [isRecording]);

  return (
    <div className="p-6 border rounded-xl shadow-md bg-white flex flex-col gap-4">

      {/* TIMER */}
      <div className="text-lg font-semibold">
        ⏱ {time}s{" "}
        {isRecording &&
          "🔴 Recording..."}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 flex-wrap">

        <button
          onClick={startRecording}
          disabled={isRecording}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Start
        </button>

        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Stop
        </button>

        <button
          onClick={downloadAudio}
          disabled={!audioUrl}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download
        </button>

      </div>

      {/* AUDIO PLAYER */}
      {audioUrl && (
        <div className="mt-4">
          <p className="font-medium mb-2">
            🎵 Recorded Audio:
          </p>

          <audio
            controls
            className="w-full"
          >
            <source
              src={audioUrl}
              type="audio/webm"
            />

            Your browser does not support
            audio playback.
          </audio>
        </div>
      )}
    </div>
  );
}