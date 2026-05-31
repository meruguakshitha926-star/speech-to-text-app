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
        <h1 className="text-2xl font-semibold tracking-tight mb-6">Transcript history</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl" role="alert">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Loading transcripts…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-foreground font-medium mb-2">No saved transcripts yet.</p>
            <p className="text-muted-foreground text-sm mb-6">Start recording to create your first transcript.</p>
            <Link
              href="/record"
              className="inline-block px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow"
            >
              Record audio
            </Link>
          </div>
        ) : (
          <ul className="space-y-4" aria-label="Saved transcripts">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/history/${item.id}`}
                  className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex flex-wrap justify-between gap-2 mb-3">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.filename || `Transcript #${item.id}`}
                    </span>
                    <time className="text-sm text-muted-foreground" dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.preview}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {item.duration_seconds != null && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.duration_seconds}s
                      </span>
                    )}
                    {item.language && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {item.language}
                      </span>
                    )}
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
