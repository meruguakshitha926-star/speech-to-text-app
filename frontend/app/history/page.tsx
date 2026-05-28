"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import { listTranscripts, type TranscriptListItem } from "../../lib/api";

export default function HistoryPage() {
  const { token, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<TranscriptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) {
      router.replace("/login?next=/history");
      return;
    }
    listTranscripts(token)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [authLoading, user, token, router]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen">
        <Header />
        <p className="p-6 text-center text-zinc-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6">Transcript history</h1>
        {error && (
          <p className="text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-zinc-600">Loading transcripts…</p>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
            <p className="text-zinc-600 mb-4">No saved transcripts yet.</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
            >
              Record audio
            </Link>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Saved transcripts">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/history/${item.id}`}
                  className="block bg-white rounded-xl border border-zinc-200 p-4 hover:border-emerald-400 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-wrap justify-between gap-2 mb-2">
                    <span className="font-medium text-zinc-900">
                      {item.filename || `Transcript #${item.id}`}
                    </span>
                    <time className="text-sm text-zinc-500" dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2">{item.preview}</p>
                  <div className="mt-2 flex gap-3 text-xs text-zinc-500">
                    {item.duration_seconds != null && (
                      <span>{item.duration_seconds}s</span>
                    )}
                    {item.language && <span>{item.language}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
