import { API_BASE_URL } from '../config';

export function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || `Request failed (${response.status})`);
  }

  return payload;
}

export function resolvePhotoUrl(photoPath?: string): string {
  const raw = (photoPath ?? '').trim();
  if (!raw) {
    return '';
  }
  if (/^(https?:|data:|blob:|file:)/i.test(raw)) {
    return raw;
  }
  const path = raw.startsWith('/') ? raw : `/${raw.replace(/^\.\//, '')}`;
  return buildApiUrl(path);
}
