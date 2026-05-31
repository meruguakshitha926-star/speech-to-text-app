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
  const [wsConnected, setWsConnected] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(0);

  const startRecording = async () => {
    try {
      if (onStreamStart) onStreamStart();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const setupAndStartRecorder = () => {
        // Try different mime types in order of preference
        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/ogg",
        ];
        let selectedMimeType = "";
        for (const type of mimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type;
            break;
          }
        }
        // If none found, use default
        if (!selectedMimeType) {
          selectedMimeType = "";
        }

        let mediaRecorder: MediaRecorder;
        if (selectedMimeType) {
          mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType });
        } else {
          mediaRecorder = new MediaRecorder(stream);
          selectedMimeType = mediaRecorder.mimeType;
        }

        mimeTypeRef.current = selectedMimeType;
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        console.log("MediaRecorder initialized with mimeType:", selectedMimeType);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
            console.log("Received data chunk, size:", event.data.size, "total chunks:", chunksRef.current.length);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(event.data);
            }
          }
        };

        mediaRecorder.onstop = () => {
          console.log("MediaRecorder stopped, creating blob from", chunksRef.current.length, "chunks");
          const audioBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
          console.log("Created blob with size:", audioBlob.size, "and type:", audioBlob.type);
          if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
          }
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          onRecordingComplete(audioBlob, durationRef.current);
        };

        mediaRecorder.start(250); // Back to 250ms chunks for better live transcription
        setIsRecording(true);
      };

      const api = process.env.NEXT_PUBLIC_API;
      const wsBase =
        api?.replace("http", "ws").replace("https", "wss") + "/stream";
      const wsUrl = wsBase
        ? `${wsBase}?language=${encodeURIComponent(language)}`
        : "";

      console.log("Attempting WebSocket connection to:", wsUrl);

      if (wsUrl && !wsUrl.includes("undefined")) {
        setWsConnected(false);
        let wsConnected = false;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("WebSocket connected successfully");
          wsConnected = true;
          setWsConnected(true);
          setupAndStartRecorder();
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error occurred:", error);
          setWsConnected(false);
          if (!isRecording) {
            console.log("Starting recording without live transcription due to WebSocket error");
            setupAndStartRecorder();
          }
        };

        wsRef.current.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          setWsConnected(false);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (onPartialTranscript) {
              onPartialTranscript(data.transcript, data.is_final);
            }
          } catch (e) {
            console.error("Error parsing WebSocket message:", e);
          }
        };

        // Set a timeout to start recording if WebSocket doesn't connect quickly
        wsTimeoutRef.current = setTimeout(() => {
          if (!isRecording && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
            console.log("WebSocket connection timeout, starting recording without live transcription");
            setWsConnected(false);
            setupAndStartRecorder();
          }
        }, 3000);
      } else {
        console.log("No WebSocket URL, starting recording without live transcription");
        setWsConnected(false);
        setupAndStartRecorder();
      }
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Microphone permission denied or error occurred.");
    }
  };

  const stopRecording = () => {
    // Clear the timeout if it exists
    if (wsTimeoutRef.current) {
      clearTimeout(wsTimeoutRef.current);
      wsTimeoutRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    setWsConnected(false);
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
      className="p-6 sm:p-8 border border-border rounded-2xl shadow-sm bg-card flex flex-col gap-6"
      aria-label="Audio recorder"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3" aria-live="polite">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse-soft' : 'bg-muted'}`} />
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </span>
          {isRecording && (
            <span className="ml-2 text-sm text-red-500 font-medium">Recording</span>
          )}
          {isRecording && wsConnected && (
            <span className="ml-2 text-sm text-green-500 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Live
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs font-mono">Space</kbd> to toggle
        </p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={startRecording}
          disabled={isRecording}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Start recording"
        >
          Start Recording
        </button>

        <button
          type="button"
          onClick={stopRecording}
          disabled={!isRecording}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500/50"
          aria-label="Stop recording"
        >
          Stop
        </button>

        <button
          type="button"
          onClick={downloadAudio}
          disabled={!audioUrl}
          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-border"
          aria-label="Download recorded audio"
        >
          Download
        </button>
      </div>

      {audioUrl && (
        <div className="mt-2 pt-6 border-t border-border">
          <p className="font-medium mb-3 text-sm text-foreground">Recorded audio</p>
          <audio controls className="w-full h-10" aria-label="Playback of last recording">
            <source src={audioUrl} type="audio/webm" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </section>
  );
}
