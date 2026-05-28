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
        <p className="p-6 text-center">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
        <Link
          href="/history"
          className="text-sm text-emerald-700 hover:underline mb-4 inline-block"
        >
          ← Back to history
        </Link>
        {error ? (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        ) : !transcript ? (
          <p className="text-zinc-600">Loading transcript…</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => downloadFromApi("txt")}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
                aria-label="Download from server as text"
              >
                Server .txt
              </button>
              <button
                type="button"
                onClick={() => downloadFromApi("docx")}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 text-white hover:bg-zinc-700"
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
