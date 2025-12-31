// lib/api.ts
export function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (envUrl && envUrl.trim()) {
    return `${envUrl.replace(/\/$/, "")}/api`;
  }

  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:3001/api`;
  }

  return "http://localhost:3001/api";
}

// ✅ Mantém o nome API_BASE, mas agora é função (não congela)
export const API_BASE = () => getApiBase();
