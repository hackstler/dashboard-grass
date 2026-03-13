export const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function extractErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await res.json()) as Record<string, unknown>;
    if (typeof body.message === "string") return body.message;
    if (typeof body.error === "string") return body.error;
  } catch {
    // ignore parse errors
  }
  return `${fallback}: HTTP ${res.status}`;
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  rawBody?: BodyInit;
  public?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!options?.public) Object.assign(headers, authHeaders());
  if (options?.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : options?.rawBody,
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, "Request failed"));
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export async function apiRequestNullable<T>(
  path: string,
  options?: RequestOptions
): Promise<T | null> {
  const headers: Record<string, string> = {};
  if (!options?.public) Object.assign(headers, authHeaders());
  if (options?.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : options?.rawBody,
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, "Request failed"));
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : null;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, "Upload failed"));
  }

  return (await res.json()) as T;
}
