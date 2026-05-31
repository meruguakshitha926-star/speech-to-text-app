"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import TranscriptPanel from "../../../components/TranscriptPanel";
import { useAuth } from "../../../context/AuthContext";
import { downloadUrl, getTranscript, type Transcript } from "../../../lib/api";

export default function TranscriptDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.replace(`/login?next=/history/${id}`);
      return;
    }
    if (!Number.isFinite(id)) {
      setError("Invalid transcript");
      return;
    }
    getTranscript(id, token)
      .then(setTranscript)
      .catch(() => setError("Transcript not found"));
  }, [authLoading, user, token, id, router]);

  const downloadFromApi = async (format: "txt" | "docx") => {
    if (!token || !transcript) return;
    const res = await fetch(downloadUrl(transcript.id, format), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${transcript.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Link
          href="/history"
          className="text-sm text-primary hover:underline mb-6 inline-block flex items-center gap-1 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to history
        </Link>
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl" role="alert">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : !transcript ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Loading transcript…</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                onClick={() => downloadFromApi("txt")}
                className="px-4 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors duration-200"
                aria-label="Download from server as text"
              >
                Server .txt
              </button>
              <button
                type="button"
                onClick={() => downloadFromApi("docx")}
                className="px-4 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors duration-200"
                aria-label="Download from server as Word document"
              >
                Server .docx
              </button>
            </div>
            <TranscriptPanel
              text={transcript.text}
              transcriptId={transcript.id}
              createdAt={transcript.created_at}
              filename={transcript.filename}
            />
          </>
        )}
      </main>
    </div>
  );
}
