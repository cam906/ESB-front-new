import { cookies } from "next/headers";
import { getBackendBaseUrl } from "@/app/lib/backend";

export async function POST(req: Request) {
  const backend = getBackendBaseUrl();
  const body = await req.text();

  const resp = await fetch(`${backend}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    credentials: "include",
  });

  const text = await resp.text();
  const h = new Headers(resp.headers);
  const setCookie = resp.headers.get("set-cookie");
  if (setCookie) {
    // forward backend cookie (JWT in HttpOnly cookie)
    h.set("set-cookie", setCookie);
  }
  return new Response(text, { status: resp.status, headers: h });
}


