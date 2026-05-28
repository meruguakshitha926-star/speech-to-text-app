"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  language: string;
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
  onPartialTranscript?: (text: string, isFinal: boolean) => void;
  onStreamStart?: () => void;
};

export default function RecorderPanel({
  language,
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
  const durationRef = useRef(0);

  const startRecording = async () => {
    try {
      if (onStreamStart) onStreamStart();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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
          onRecordingComplete(audioBlob, durationRef.current);
        };

        mediaRecorder.start(250);
        setIsRecording(true);
      };

      const api = process.env.NEXT_PUBLIC_API;
      const wsBase =
        api?.replace("http", "ws").replace("https", "wss") + "/stream";
      const wsUrl = wsBase
        ? `${wsBase}?language=${encodeURIComponent(language)}`
        : "";

      if (wsUrl && !wsUrl.includes("undefined")) {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setupAndStartRecorder();
        };

        wsRef.current.onerror = () => {
          if (!isRecording) setupAndStartRecorder();
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onPartialTranscript) {
              onPartialTranscript(data.transcript, data.is_final);
            }
          } catch {
            /* ignore */
          }
        };
      } else {
        setupAndStartRecorder();
      }
    } catch {
      alert("Microphone permission denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "recording.webm";
    a.click();
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setTime((prev) => {
          const next = prev + 1;
          durationRef.current = next;
          return next;
        });
      }, 1000);
    } else {
      setTime(0);
      durationRef.current = 0;
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        if (isRecording) stopRecording();
        else startRecording();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRecording]);

  return (
    <section
      className="p-6 border border-zinc-200 rounded-xl shadow-sm bg-white flex flex-col gap-4"
      aria-label="Audio recorder"
    >
      <div className="text-lg font-semibold" aria-live="polite">
        <span aria-hidden="true">⏱ </span>
        {time}s
        {isRecording && (
          <span className="ml-2 text-red-600 font-normal">Recording…</span>
        )}
      </div>
      <p className="text-xs text-zinc-500">Tip: press Space to start/stop recording</p>

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={startRecording}
          disabled={isRecording}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Start recording"
        >
          Start
        </button>

        <button
          type="button"
          onClick={stopRecording}
          disabled={!isRecording}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Stop recording"
        >
          Stop
        </button>

        <button
          type="button"
          onClick={downloadAudio}
          disabled={!audioUrl}
          className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
          aria-label="Download recorded audio"
        >
          Download audio
        </button>
      </div>

      {audioUrl && (
        <div className="mt-2">
          <p className="font-medium mb-2 text-sm text-zinc-700">Recorded audio</p>
          <audio controls className="w-full" aria-label="Playback of last recording">
            <source src={audioUrl} type="audio/webm" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </section>
  );
}
