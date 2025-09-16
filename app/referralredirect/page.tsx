"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ReferralRedirectInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    const next = params.get("next") || "/";
    if (code) {
      localStorage.setItem("referral_code", code);
    }
    router.replace(next);
  }, [params, router]);

  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-2xl font-bold">Redirecting…</h1>
      <p className="dark:text-gray-400">Processing your referral link.</p>
    </div>
  );
}

export default function ReferralRedirectPage() {
  return (
    <Suspense fallback={<div className="container mx-auto gutters section-spacing"><p>Loading…</p></div>}>
      <ReferralRedirectInner />
    </Suspense>
  );
}


