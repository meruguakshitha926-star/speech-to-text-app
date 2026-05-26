"use client";

import { useState } from "react";
import Header from "../components/Header";
import RecorderPanel from "../components/RecorderPanel";
import TranscriptPanel from "../components/TranscriptPanel";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [partialText, setPartialText] = useState("");

  // Transcribe full uploaded audio as usual
  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      setText("Uploading full audio...");
      setPartialText(""); // clear partials

      const audioFile = new File([audioBlob], "speech.webm", {
        type: "audio/webm",
      });

      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setText(data.transcript);

    } catch (error) {
      console.error("Upload Error:", error);
      setText("Error transcribing audio");
    } finally {
      setLoading(false);
    }
  };

  const currentTranscript = loading ? "Transcribing..." : text + (partialText ? ((text ? " " : "") + partialText) : "");

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-3xl mx-auto p-6">
        <RecorderPanel
          onRecordingComplete={handleRecordingComplete}
          onPartialTranscript={(partial, isFinal) => {
            if (isFinal) {
              setText((prev) => prev + " " + partial);
              setPartialText("");
            } else {
              setPartialText(partial);
            }
          }}
          onStreamStart={() => setText("")}
        />

        <TranscriptPanel
          text={currentTranscript}
        />
      </div>
    </div>
  );
}