// lib/api.ts
export function getApiBase(): string {
  // 1) Preferência absoluta: NEXT_PUBLIC_API_URL = http://172.28.7.6:3001
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) return `${envUrl.replace(/\/$/, "")}/api`;

  // 2) Se estiver no browser, usa o hostname atual (IP/host que abriu o front)
  // e fixa a porta 3001 do backend.
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3001/api`;
  }

  // 3) Fallback SSR/dev local
  return "http://localhost:3001/api";
}

export const API_BASE = getApiBase();
