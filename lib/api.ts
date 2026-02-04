// lib/api.ts
export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base && base.trim()) return base.replace(/\/$/, "");

  // ✅ No browser (produção), use mesma origem (HTTPS) via /api
  if (typeof window !== "undefined") {
    return "/api";
  }

  // ✅ No server-side (dev), fallback local
  return "http://localhost:3001/api";
}

export const API_BASE = () => getApiBase();
