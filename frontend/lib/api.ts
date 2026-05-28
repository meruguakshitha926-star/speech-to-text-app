const API = process.env.NEXT_PUBLIC_API || "http://localhost:8000";

function formatApiError(data: { detail?: string | { msg: string }[] }): string {
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(", ");
  return "Request failed";
}

export type User = { id: number; email: string };

export type TranscriptListItem = {
  id: number;
  filename: string | null;
  language: string | null;
  duration_seconds: number | null;
  created_at: string;
  preview: string;
};

export type Transcript = {
  id: number;
  user_id: number | null;
  text: string;
  filename: string | null;
  language: string | null;
  duration_seconds: number | null;
  created_at: string;
};

function authHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(formatApiError(data));
  return data as { access_token: string; user: User };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(formatApiError(data));
  return data as { access_token: string; user: User };
}

export async function fetchMe(token: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Session expired");
  return (await res.json()) as User;
}

export async function transcribeFile(
  file: File,
  token: string | null,
  durationSeconds?: number,
  language: string = "auto"
) {
  const formData = new FormData();
  formData.append("file", file);
  const url = new URL(`${API}/transcribe`);
  url.searchParams.set("language", language);
  if (durationSeconds != null) {
    url.searchParams.set("duration_seconds", String(durationSeconds));
  }
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  return res.json() as Promise<{
    status: string;
    transcript?: string;
    language?: string;
    transcript_id?: number;
    message?: string;
  }>;
}

export async function listTranscripts(token: string) {
  const res = await fetch(`${API}/transcripts`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load transcripts");
  return (await res.json()) as TranscriptListItem[];
}

export async function getTranscript(id: number, token: string) {
  const res = await fetch(`${API}/transcripts/${id}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Transcript not found");
  return (await res.json()) as Transcript;
}

export function downloadUrl(id: number, format: "txt" | "docx") {
  return `${API}/transcripts/${id}/download?format=${format}`;
}

export function getApiBase() {
  return API;
}
