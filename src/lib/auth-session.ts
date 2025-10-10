// Session management utility: unify token storage in cookie + localStorage and auto-expire after 1 hour
// We keep backend JWT TTL = 60 minutes (see backend config). We mirror that client-side.

'use client';

export type LogoutReason = 'manual' | 'expired' | 'window-closed';

const ONE_HOUR_MS = 60 * 60 * 1000;
const COOKIE_NAME = 'auth_token';
const COOKIE_EXP_KEY = 'auth_exp'; // epoch ms in localStorage for quick checks

function isClient() { return typeof window !== 'undefined'; }

export function setSessionToken(token: string, ttlMs: number = ONE_HOUR_MS) {
  if (!isClient()) return;
  const exp = Date.now() + ttlMs;
  try {
    // cookie (path=/ so middleware can read). Use expires attribute.
    const expires = new Date(exp).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; Expires=${expires}; Path=/; SameSite=Lax`;
    localStorage.setItem('login_at', String(Date.now()));
    localStorage.setItem(COOKIE_EXP_KEY, String(exp));
  } catch {}
}

export function readSessionToken(): string | null {
  if (!isClient()) return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export function clearSessionToken() {
  if (!isClient()) return;
  try {
    document.cookie = `${COOKIE_NAME}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/;`;
    localStorage.removeItem(COOKIE_EXP_KEY);
  } catch {}
}

export function isExpired(): boolean {
  if (!isClient()) return true;
  const raw = localStorage.getItem(COOKIE_EXP_KEY);
  if (!raw) return true;
  const exp = Number(raw);
  if (Number.isNaN(exp)) return true;
  return Date.now() >= exp;
}

let logoutTimer: any = null;
const listeners: Array<(r: LogoutReason)=>void> = [];

export function onAutoLogout(cb: (reason: LogoutReason)=>void) { listeners.push(cb); }

function fire(reason: LogoutReason) { listeners.forEach(l => { try { l(reason); } catch {} }); }

export function scheduleAutoLogout() {
  if (!isClient()) return;
  if (logoutTimer) { clearTimeout(logoutTimer); logoutTimer = null; }
  const raw = localStorage.getItem(COOKIE_EXP_KEY);
  if (!raw) return; // nothing
  const exp = Number(raw);
  if (Number.isNaN(exp)) return;
  const delay = Math.max(0, exp - Date.now());
  logoutTimer = setTimeout(() => {
    fire('expired');
  }, delay);
}

// Broadcast logout across tabs via storage event
const BROADCAST_KEY = 'broadcast_logout';

export function broadcastLogout(reason: LogoutReason) {
  try { localStorage.setItem(BROADCAST_KEY, JSON.stringify({ reason, ts: Date.now() })); } catch {}
}

if (isClient()) {
  window.addEventListener('storage', (e) => {
    if (e.key === BROADCAST_KEY && e.newValue) {
      try { const { reason } = JSON.parse(e.newValue); fire(reason); } catch {}
    }
  });
  window.addEventListener('beforeunload', () => {
    // We treat window close as logout trigger so token invalidation happens client side
    broadcastLogout('window-closed');
  });
}
