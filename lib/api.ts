export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (base && base.trim()) return base.replace(/\/$/, "");

  // No browser: sempre mesma origem
  if (typeof window !== "undefined") {
    return "/api";
  }

  // No server (SSR): também pode usar /api sem problema
  return "/api";
}

export const API_BASE = () => getApiBase();
