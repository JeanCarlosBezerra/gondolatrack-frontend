export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base && base.trim()) return base.replace(/\/$/, "");

  // ===== ALTERAÇÃO: em DEV, browser também aponta pro backend =====
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3001/api";
  }
  // ===== FIM ALTERAÇÃO =====

  // produção: mesma origem via /api
  if (typeof window !== "undefined") {
    return "/api";
  }

  return "http://localhost:3001/api";
}

export const API_BASE = () => getApiBase();