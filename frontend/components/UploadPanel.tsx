"use client";

import { useState, useRef } from "react";
import { transcribeFile } from "../lib/api";

type Props = {
  token: string | null;
  language: string;
  onTranscriptComplete: (text: string, language: string | null, transcriptId: number | null) => void;
  onTranscriptStart: () => void;
  disabled?: boolean;
};

export default function UploadPanel({
  token,
  language,
  onTranscriptComplete,
  onTranscriptStart,
  disabled = false,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/webm"];
      if (validTypes.includes(file.type) || file.name.match(/\.(mp3|wav|m4a|webm)$/i)) {
        setSelectedFile(file);
        setError("");
      } else {
        setError("Please select a valid audio file (MP3, WAV, M4A, or WebM)");
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/webm"];
      if (validTypes.includes(file.type) || file.name.match(/\.(mp3|wav|m4a|webm)$/i)) {
        setSelectedFile(file);
        setError("");
      } else {
        setError("Please select a valid audio file (MP3, WAV, M4A, or WebM)");
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError("");
      onTranscriptStart();

      const data = await transcribeFile(selectedFile, token, undefined, language);

      if (data.status === "ok" && data.transcript) {
        onTranscriptComplete(data.transcript, data.language || null, data.transcript_id || null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(data.message || "Error transcribing audio");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Error transcribing audio");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <section
      className="p-6 sm:p-8 border border-border rounded-2xl shadow-sm bg-card flex flex-col gap-6"
      aria-label="Audio file upload"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Upload Audio File</h2>
        <p className="text-sm text-muted-foreground">
          Upload an existing audio file for transcription. Supports MP3, WAV, M4A, and WebM formats.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          selectedFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.m4a,.webm,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/webm"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          id="file-upload"
          aria-label="Upload audio file"
        />
        {!selectedFile ? (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">Drop your audio file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <label
              htmlFor="file-upload"
              className={`inline-block px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors duration-200 cursor-pointer ${
                disabled || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Select File
            </label>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-1">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground mb-4">{formatFileSize(selectedFile.size)}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setError("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={uploading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {selectedFile && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading || disabled}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          {uploading ? "Transcribing…" : "Upload & Transcribe"}
        </button>
      )}
    </section>
  );
}
