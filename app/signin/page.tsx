"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Login failed");
      }
      const next = search.get("next") || "/";
      router.replace(next);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto gutters section-spacing max-w-xl">
      <h1 className="text-3xl font-bold mb-4">Sign In</h1>
      {error && (
        <div className="card p-3 mb-4 border border-red-200 text-red-600 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            className="w-full p-3 form-field bg-white dark:bg-slate-900"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full p-3 form-field bg-white dark:bg-slate-900"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button disabled={loading} type="submit" className="w-full btn-primary text-black font-bold py-3 rounded-lg">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}


