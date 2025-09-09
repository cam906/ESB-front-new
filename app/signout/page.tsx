"use client";
import { useEffect } from "react";
import { signOut } from "aws-amplify/auth";

export default function SignOutPage() {
  useEffect(() => {
    (async () => {
      try {
        await signOut({ global: false });
      } catch { }
      try {
        await fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: '' }),
        });
      } catch { }
      window.location.replace('/');
    })();
  }, []);
  return null;
}


