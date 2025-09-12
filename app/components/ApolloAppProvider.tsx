"use client";

import { ApolloProvider } from "@apollo/client/react";
import { authFetch } from "../lib/authFetch";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

export default function ApolloAppProvider({ children }: { children: React.ReactNode; }) {
  const client = new ApolloClient({
    link: new HttpLink({ uri: "/api/graphql", fetch: authFetch as unknown as typeof fetch }),
    cache: new InMemoryCache(),
  });
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}


