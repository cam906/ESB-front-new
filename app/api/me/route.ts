import { cookies, headers } from "next/headers";
import { getBackendBaseUrl } from "@/app/lib/backend";

export async function GET() {
  const cookieHeader = cookies().toString();
  const backend = getBackendBaseUrl();
  const resp = await fetch(`${backend}/auth/me`, {
    method: "GET",
    headers: { cookie: cookieHeader },
    credentials: "include",
    cache: "no-store",
  });

  const body = await resp.text();
  const h = new Headers();
  h.set("content-type", resp.headers.get("content-type") || "application/json");
  return new Response(body, { status: resp.status, headers: h });
}


