export function getBackendBaseUrl() {
  // Prefer explicit environment override
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // Vercel/production detection
  if (process.env.NODE_ENV === "production") {
    return "https://elitesportsbets.com";
  }
  // Local dev default
  return "http://localhost:3000";
}


