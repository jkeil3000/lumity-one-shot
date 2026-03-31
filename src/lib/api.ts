import { getToken, clearToken } from './auth';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const headers = new Headers((init.headers as HeadersInit) || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const res = await fetch(`/api/proxy/${normalizedPath}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    const err = new Error('UNAUTHENTICATED') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return null;
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return text;
  }

  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}
