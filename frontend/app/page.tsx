"use client";

import { useState } from "react";
import Header from "../components/Header";
import RecorderPanel from "../components/RecorderPanel";
import TranscriptPanel from "../components/TranscriptPanel";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // Receive audio blob from RecorderPanel
  const handleRecordingComplete = async (
    audioBlob: Blob
  ) => {
    try {
      setLoading(true);
      setText("Uploading audio...");

      // Convert Blob → File
      const audioFile = new File(
        [audioBlob],
        "speech.webm",
        {
          type: "audio/webm",
        }
      );

      // Create FormData
      const formData = new FormData();
      formData.append("file", audioFile);

      // Send audio to backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      // Show transcript
      setText(data.transcript);

    } catch (error) {
      console.error("Upload Error:", error);
      setText("Error transcribing audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-3xl mx-auto p-6">
        <RecorderPanel
          onRecordingComplete={
            handleRecordingComplete
          }
        />

        <TranscriptPanel
          text={
            loading
              ? "Transcribing..."
              : text
          }
        />
      </div>
    </div>
  );
}