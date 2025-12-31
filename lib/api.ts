// lib/api.ts
export function getApiBase(): string {
  // Use SEMPRE a variável pública. Evita hydration mismatch.
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // Se não existir, assume backend local.
  // (Mesmo no client e no server => não diverge)
  const base = (envUrl && envUrl.trim())
    ? envUrl.replace(/\/$/, "")
    : "http://localhost:3001";

  return `${base}/api`;
}

export const API_BASE = getApiBase();
