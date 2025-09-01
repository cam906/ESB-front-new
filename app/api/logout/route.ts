import { getBackendBaseUrl } from "@/app/lib/backend";

export async function POST() {
  const backend = getBackendBaseUrl();
  const resp = await fetch(`${backend}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const h = new Headers(resp.headers);
  const setCookie = resp.headers.get("set-cookie");
  if (setCookie) {
    h.set("set-cookie", setCookie);
  }
  return new Response(null, { status: 204, headers: h });
}


