"use client";
import { fetchAuthSession } from "aws-amplify/auth";

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



