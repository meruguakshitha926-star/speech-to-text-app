"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onRecordingComplete: (blob: Blob) => void;
  onPartialTranscript?: (text: string, isFinal: boolean) => void;
  onStreamStart?: () => void;
};

export default function RecorderPanel({
  onRecordingComplete,
  onPartialTranscript,
  onStreamStart,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 🎤 START RECORDING
  const startRecording = async () => {
    try {
      if (onStreamStart) onStreamStart();

      // Ask microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      // Create recorder function
      const setupAndStartRecorder = () => {
        let mediaRecorder: MediaRecorder;
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
          });
        } else {
          mediaRecorder = new MediaRecorder(stream);
        }

        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(event.data);
            }
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
          }
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          onRecordingComplete(audioBlob);
        };

        mediaRecorder.start(250);
        setIsRecording(true);
      };

      // Connect WebSocket if streaming
      const wsUrl = process.env.NEXT_PUBLIC_API?.replace("http", "ws")?.replace("https", "wss") + "/stream";
      if (wsUrl && !wsUrl.includes("undefined")) {
          wsRef.current = new WebSocket(wsUrl);
          
          wsRef.current.onopen = () => {
              console.log("WebSocket connected for streaming.");
              setupAndStartRecorder();
          };

          wsRef.current.onerror = (e) => {
              console.error("WebSocket Error: ", e);
              // Fallback: start anyway if WS fails to connect
              if (!isRecording) setupAndStartRecorder();
          };

          wsRef.current.onmessage = (event) => {
              console.log("LIVE MESSAGE:", event.data);
              try {
                  const data = JSON.parse(event.data);
                  if (onPartialTranscript) {
                      onPartialTranscript(data.transcript, data.is_final);
                  }
              } catch(e) {
                  console.error(e);
              }
          };
      } else {
         setupAndStartRecorder();
      }

    } catch (error) {
      console.error("Microphone Error:", error);
      alert("Microphone permission denied.");
    }
  };

  // ⏹ STOP RECORDING
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  // 📥 DOWNLOAD AUDIO
  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
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
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="p-6 border rounded-xl shadow-md bg-white flex flex-col gap-4">
      {/* TIMER */}
      <div className="text-lg font-semibold">
        ⏱ {time}s {isRecording && "🔴 Recording..."}
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
          <p className="font-medium mb-2">🎵 Recorded Audio (Full):</p>
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/webm" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  );
}