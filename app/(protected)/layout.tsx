"use client";
import { Authenticator } from "@aws-amplify/ui-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator>{({ signOut, user }) => <>{children}</>}</Authenticator>
  );
}


