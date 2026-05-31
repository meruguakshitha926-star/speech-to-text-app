"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            S
          </span>
          Speech to Text
        </Link>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm" aria-label="Main navigation">
          <Link
            href="/"
            className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-medium"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                href="/record"
                className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-medium"
              >
                Record
              </Link>
              <Link
                href="/history"
                className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-medium"
              >
                History
              </Link>
              <span className="text-muted-foreground hidden sm:inline text-xs px-2">{user.email}</span>
              <button
                type="button"
                onClick={signOut}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-all duration-200 font-medium"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/record"
                className="px-3 py-2 rounded-lg hover:bg-secondary transition-colors duration-200 font-medium"
              >
                Record
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-200 font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
