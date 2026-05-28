"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchMe, login, register, type User } from "../lib/api";

const TOKEN_KEY = "stt_token";
const USER_KEY = "stt_user";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* ignore */
      }
    }
    fetchMe(storedToken)
      .then((u) => {
        setUser(u);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((accessToken: string, u: User) => {
    setToken(accessToken);
    setUser(u);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await login(email, password);
      persist(data.access_token, data.user);
    },
    [persist]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const data = await register(email, password);
      persist(data.access_token, data.user);
    },
    [persist]
  );

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, signIn, signUp, signOut }),
    [user, token, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
