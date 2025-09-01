"use client";
import { useCallback, useEffect, useState } from "react";

type User = { id: string; role?: string; email?: string } | null;

export function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchMe = useCallback(async () => {
    try {
      setIsLoading(true);
      const r = await fetch("/api/me", { credentials: "include", cache: "no-store" });
      if (!r.ok) {
        setUser(null);
      } else {
        const data = await r.json();
        setUser(data);
      }
      setError(null);
    } catch (e) {
      setError(e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return { user, isLoading, isAuthenticated: !!user, error, refresh: fetchMe } as const;
}


