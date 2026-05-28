"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import RecorderPanel from "../components/RecorderPanel";
import TranscriptPanel from "../components/TranscriptPanel";
import LanguageSelector from "../components/LanguageSelector";
import { useAuth } from "../context/AuthContext";
import { transcribeFile } from "../lib/api";

export default function Home() {
  const { token, user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [transcriptId, setTranscriptId] = useState<number | null>(null);
  const [language, setLanguage] = useState("auto");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob, durationSeconds: number) => {
    try {
      setLoading(true);
      setText("Uploading and transcribing…");
      setPartialText("");
      setTranscriptId(null);
      const audioFile = new File([audioBlob], "speech.webm", {
        type: "audio/webm",
      });

      const data = await transcribeFile(audioFile, token, durationSeconds, language);

      if (data.status === "ok" && data.transcript) {
        setText(data.transcript);
        if (data.language) setDetectedLanguage(data.language);
        if (data.transcript_id) setTranscriptId(data.transcript_id);
      } else {
        setText(data.message || "Error transcribing audio");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setText("Error transcribing audio");
    } finally {
      setLoading(false);
    }
  };

  const currentTranscript = loading
    ? "Transcribing…"
    : text + (partialText ? (text ? " " : "") + partialText : "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
        {!user && (
          <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>{" "}
            to save transcripts to your private history.
          </p>
        )}
        <div className="mb-4">
          <LanguageSelector
            value={language}
            onChange={setLanguage}
            disabled={loading}
          />
        </div>
        <RecorderPanel
          language={language}
          onRecordingComplete={handleRecordingComplete}
          onPartialTranscript={(partial, isFinal) => {
            if (isFinal) {
              setText((prev) => (prev ? prev + " " : "") + partial);
              setPartialText("");
            } else {
              setPartialText(partial);
            }
          }}
          onStreamStart={() => {
            setText("");
            setTranscriptId(null);
          }}
        />
        {detectedLanguage && (
          <p className="text-sm text-zinc-500 -mt-2 mb-2">
            Detected language: <span className="font-medium">{detectedLanguage}</span>
          </p>
        )}
        <TranscriptPanel
          text={currentTranscript}
          transcriptId={transcriptId}
          filename="speech.webm"
        />
      </main>
    </div>
  );
}
