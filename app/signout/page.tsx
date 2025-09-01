"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    // Placeholder: clear auth/session
    localStorage.removeItem("auth_token");
    router.replace("/");
  }, [router]);

  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-2xl font-bold">Signing out…</h1>
      <p className="dark:text-gray-400">You will be redirected shortly.</p>
    </div>
  );
}


