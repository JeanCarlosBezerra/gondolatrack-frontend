// src/lib/apiFetch.ts
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, {
    ...init,
    cache: init.cache ?? "no-store",
    credentials: "include",
    headers: {
      ...(init.headers ?? {}),
    },
  });
}
