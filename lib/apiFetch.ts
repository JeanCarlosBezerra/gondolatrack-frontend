// === INÍCIO: lib/apiFetch.ts (ALTERADO) ===
export type ApiError = {
  statusCode?: number;
  message?: any;
  error?: string;
};

type ApiFetchOptions = RequestInit & {
  raw?: boolean;
};

export async function apiFetch<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,

    // >>> ALTERAÇÃO: manda cookies (gt_token) junto
    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const err: ApiError = (data ?? {}) as any;
    if (!err.statusCode) err.statusCode = res.status;
    if (!err.message) err.message = res.statusText;
    throw err;
  }

  return data as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
// === FIM ===
