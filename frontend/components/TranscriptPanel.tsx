"use client";

import { useCallback, useEffect, useState } from "react";
import { downloadUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type Props = {
  text: string;
  transcriptId?: number | null;
  createdAt?: string;
  filename?: string | null;
};

export default function TranscriptPanel({
  text,
  transcriptId,
  createdAt,
  filename,
}: Props) {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  const displayText = text || "No transcript yet...";
  const hasText = Boolean(text?.trim());

  const copyText = useCallback(async () => {
    if (!hasText) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [hasText, text]);

  const downloadTxt = useCallback(() => {
    if (!hasText) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (filename || "transcript").replace(/\.[^.]+$/, "") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [hasText, text, filename]);

  const downloadDocx = useCallback(() => {
    if (!transcriptId || !token) return;
    const url = downloadUrl(transcriptId, "docx");
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", "");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }, [transcriptId, token]);

  const shareLink = useCallback(() => {
    if (!transcriptId) {
      setShareMsg("Save while signed in to get a share link");
      return;
    }
    const url = `${window.location.origin}/history/${transcriptId}`;
    navigator.clipboard.writeText(url);
    setShareMsg("Link copied!");
    setTimeout(() => setShareMsg(""), 2000);
  }, [transcriptId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && e.shiftKey) {
        e.preventDefault();
        copyText();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copyText]);

  return (
    <section
      className="p-6 border border-zinc-200 rounded-xl shadow-sm bg-white mt-6 min-h-[200px]"
      aria-labelledby="transcript-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="transcript-heading" className="text-xl font-bold text-zinc-900">
            Transcript
          </h2>
          {createdAt && (
            <p className="text-sm text-zinc-500 mt-1">
              {new Date(createdAt).toLocaleString()}
              {filename ? ` · ${filename}` : ""}
            </p>
          )}
        </div>
        {hasText && (
          <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Transcript actions">
            <button
              type="button"
              onClick={copyText}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50"
              aria-label="Copy transcript to clipboard"
              title="Copy (Ctrl+Shift+C)"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50"
              aria-label="Download transcript as text file"
            >
              .txt
            </button>
            {transcriptId && token && (
              <button
                type="button"
                onClick={downloadDocx}
                className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50"
                aria-label="Download transcript as Word document"
              >
                .docx
              </button>
            )}
            <button
              type="button"
              onClick={shareLink}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 hover:bg-zinc-50"
              aria-label="Copy share link"
            >
              Share
            </button>
          </div>
        )}
      </div>
      {shareMsg && <p className="text-sm text-emerald-600 mb-2">{shareMsg}</p>}
      <div
        className="text-zinc-700 whitespace-pre-wrap leading-relaxed"
        tabIndex={0}
        aria-live="polite"
      >
        {displayText}
      </div>
    </section>
  );
}
