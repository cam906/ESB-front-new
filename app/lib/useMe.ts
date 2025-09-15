"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { gql } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";

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
  const client = useApolloClient();
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
        const ME = gql`query { me { id email name credits roles myReferralCode } }`;
        const { data } = await client.query<{ me: MeUser | null }>({
          query: ME,
          fetchPolicy: "no-cache",
          context: { headers: { authorization: `Bearer ${token}` } },
        });
        if (!cancelled) setUser(data?.me ?? null);
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
  }, [client, isAuthenticated]);

  return useMemo(() => ({ user, loading, error, isAuthenticated }), [user, loading, error, isAuthenticated]);
}


