"use client";
import { useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

export default function AuthCookieSync() {
  useEffect(() => {
    async function sync() {
      try {
        const session = await fetchAuthSession();
        const token = session?.tokens?.idToken?.toString() || session?.tokens?.accessToken?.toString();
        if (!token) {
          // Clear cookie if no token
          await fetch('/api/auth/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: '' }) });
          return;
        }
        await fetch('/api/auth/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
      } catch {
        // ignore
      }
    }
    sync();

    const id = setInterval(sync, 15 * 60 * 1000); // refresh periodically
    return () => {
      clearInterval(id);
    };
  }, []);
  return null;
}


