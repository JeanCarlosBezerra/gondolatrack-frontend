// lib/api.ts
export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base && base.trim()) return base.replace(/\/$/, "");

  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url && url.trim()) return `${url.replace(/\/$/, "")}/api`;

  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3001/api`;
  }

  return "http://localhost:3001/api";
}

export const API_BASE = () => getApiBase();
