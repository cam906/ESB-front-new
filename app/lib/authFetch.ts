"use client";
import { fetchAuthSession } from "aws-amplify/auth";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const session = await fetchAuthSession();
    const token = session?.tokens?.idToken?.toString() || session?.tokens?.accessToken?.toString();
    const headers = new Headers(init?.headers || {});
    if (token) headers.set("authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  } catch {
    return fetch(input, init);
  }
}

export function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql", fetch: authFetch as unknown as typeof fetch }),
    cache: new InMemoryCache(),
  });
}


