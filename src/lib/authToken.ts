// Simple token helper. Adjust if you later move to cookies/httpOnly scenario.
const PRIMARY_KEY = 'auth_token';
// Additional fallback keys that might be used accidentally
export const TOKEN_KEYS = [PRIMARY_KEY, 'token', 'access_token', 'perusahaan_token'];

export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRIMARY_KEY, token);
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  for (const k of TOKEN_KEYS) localStorage.removeItem(k);
}
