"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

export type MeUser = {
  id: number;
  email: string;
  name?: string | null;
  credits: number;
  roles?: string | null;
  myReferralCode?: string | null;
};

export function useMe() {
  const { authStatus } = useAuthenticator((c) => [c.authStatus]);
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isAuthenticated) {
        setUser(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const session = await fetchAuthSession();
        const token = session?.tokens?.idToken?.toString() || session?.tokens?.accessToken?.toString();
        if (!token) {
          setUser(null);
          return;
        }
        const resp = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query: 'query { me { id email name credits roles myReferralCode } }' }),
        });
        if (!resp.ok) throw new Error('Failed to load me');
        const json = await resp.json();
        const me = json?.data?.me ?? null;
        if (!cancelled) setUser(me);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return useMemo(() => ({ user, loading, error, isAuthenticated }), [user, loading, error, isAuthenticated]);
}


