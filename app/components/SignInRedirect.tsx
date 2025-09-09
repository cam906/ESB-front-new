"use client";
import { useEffect } from "react";
import { signInWithRedirect } from "aws-amplify/auth";

export default function SignInRedirect() {
  useEffect(() => {
    signInWithRedirect().catch((e) => console.error("SignIn redirect failed", e));
  }, []);
  return (
    <div className="container mx-auto gutters section-spacing">
      <p className="text-center">Redirecting to sign in…</p>
    </div>
  );
}


