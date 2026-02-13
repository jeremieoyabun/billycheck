// lib/user-id.client.ts
const COOKIE_NAME = "bc_uid";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

function randomId() {
  // suffisant pour un identifiant MVP
  return (globalThis.crypto?.randomUUID?.() ?? `uid_${Math.random().toString(16).slice(2)}_${Date.now()}`);
}

export function getClientUserId(): string {
  // 1) cookie
  const fromCookie = getCookie(COOKIE_NAME);
  if (fromCookie) {
    try { localStorage.setItem(COOKIE_NAME, fromCookie); } catch {}
    return fromCookie;
  }

  // 2) localStorage
  try {
    const fromLs = localStorage.getItem(COOKIE_NAME);
    if (fromLs) {
      setCookie(COOKIE_NAME, fromLs);
      return fromLs;
    }
  } catch {}

  // 3) new id
  const uid = randomId();
  setCookie(COOKIE_NAME, uid);
  try { localStorage.setItem(COOKIE_NAME, uid); } catch {}
  return uid;
}
