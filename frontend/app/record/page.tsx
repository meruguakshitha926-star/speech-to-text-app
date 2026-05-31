"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import RecorderPanel from "../../components/RecorderPanel";
import TranscriptPanel from "../../components/TranscriptPanel";
import LanguageSelector from "../../components/LanguageSelector";
import UploadPanel from "../../components/UploadPanel";
import { useAuth } from "../../context/AuthContext";
import { transcribeFile } from "../../lib/api";

export default function RecordPage() {
  const { token, user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [transcriptId, setTranscriptId] = useState<number | null>(null);
  const [language, setLanguage] = useState("en");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"record" | "upload">("record");

  const handleRecordingComplete = async (audioBlob: Blob, durationSeconds: number) => {
    try {
      setLoading(true);
      setText("Uploading and transcribing…");
      setPartialText("");
      setTranscriptId(null);
      
      // Determine file extension based on mimeType
      let extension = "webm";
      const mimeType = audioBlob.type;
      if (mimeType.includes("ogg")) {
        extension = "ogg";
      } else if (mimeType.includes("mp3")) {
        extension = "mp3";
      } else if (mimeType.includes("wav")) {
        extension = "wav";
      } else if (mimeType.includes("m4a")) {
        extension = "m4a";
      }
      
      const filename = `speech.${extension}`;
      const audioFile = new File([audioBlob], filename, {
        type: mimeType,
      });
      
      console.log("Uploading audio file:", filename, "type:", mimeType, "size:", audioBlob.size);
      console.log("Sending language parameter to API:", language);

      const data = await transcribeFile(audioFile, token, durationSeconds, language);
      console.log("Transcription response:", data);

      if (data.status === "ok" && data.transcript) {
        setText(data.transcript);
        if (data.language) setDetectedLanguage(data.language);
        if (data.transcript_id) setTranscriptId(data.transcript_id);
      } else {
        setText(`Error: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setText(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (transcriptText: string, detectedLang: string | null, id: number | null) => {
    setText(transcriptText);
    setDetectedLanguage(detectedLang);
    setTranscriptId(id);
  };

  const handleTranscriptStart = () => {
    setText("");
    setTranscriptId(null);
    setDetectedLanguage(null);
  };

  const currentTranscript = loading
    ? "Transcribing…"
    : text + (partialText ? (text ? " " : "") + partialText : "");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!user && (
          <div className="mb-6 p-4 bg-secondary/50 border border-border rounded-xl">
            <p className="text-sm text-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>{" "}
              to save transcripts to your private history.
            </p>
          </div>
        )}
        <div className="mb-6">
          <LanguageSelector
            value={language}
            onChange={setLanguage}
            disabled={loading}
          />
        </div>

        {/* Input Mode Toggle */}
        <div className="mb-6">
          <div className="inline-flex rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setInputMode("record")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                inputMode === "record"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Record Audio
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                inputMode === "upload"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload File
            </button>
          </div>
        </div>

        {inputMode === "record" ? (
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
            onStreamStart={handleTranscriptStart}
          />
        ) : (
          <UploadPanel
            token={token}
            language={language}
            onTranscriptComplete={handleUploadComplete}
            onTranscriptStart={handleTranscriptStart}
            disabled={loading}
          />
        )}

        {detectedLanguage && (
          <p className="text-sm text-muted-foreground -mt-4 mb-6 px-1">
            Detected language: <span className="font-medium text-foreground">{detectedLanguage}</span>
          </p>
        )}
        <TranscriptPanel
          text={currentTranscript}
          transcriptId={transcriptId}
          filename={inputMode === "record" ? "speech.webm" : "uploaded-audio"}
        />
      </main>
    </div>
  );
}
