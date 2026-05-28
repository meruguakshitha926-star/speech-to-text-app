"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-zinc-900 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90">
          Speech to Text
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm" aria-label="Main navigation">
          <Link href="/" className="hover:text-emerald-300 transition-colors">
            Record
          </Link>
          {user ? (
            <>
              <Link href="/history" className="hover:text-emerald-300 transition-colors">
                History
              </Link>
              <span className="text-zinc-400 hidden sm:inline">{user.email}</span>
              <button
                type="button"
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors font-medium"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
