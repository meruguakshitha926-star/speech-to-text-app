"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/history");
  }, [loading, user, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(email, password);
      router.push("/history");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Header />
      <main className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            {mode === "login" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-zinc-600 text-sm mb-6">
            Sign in to save transcripts privately and view your history.
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
            </button>
          </form>
          <button
            type="button"
            className="mt-4 text-sm text-emerald-700 hover:underline w-full text-center"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login"
              ? "Need an account? Register"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
}
