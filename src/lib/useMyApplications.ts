import { useCallback, useEffect, useState } from "react";

type PelamarItem = Record<string, any>;

const APPLICATION_SUBMITTED_EVENT = 'application-submitted';

export function useMyApplications() {
  const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PelamarItem[] | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  // debug: expose which token (if any) was used when calling the API
  const [usedToken, setUsedToken] = useState<string | null>(null);
  const [usedUrl, setUsedUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!USE_API) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    try {
      let token =
        localStorage.getItem("access_token_siswa") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("auth_token");
      if (!token) {
        try {
          const rawUser = localStorage.getItem("user");
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            token = parsed?.access_token || parsed?.token || parsed?.accessToken || parsed?.auth_token || null;
          }
        } catch {}
      }
      const headers: Record<string, string> = { Accept: "application/json" };
      const opts: RequestInit = { method: "GET" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        opts.headers = headers;
        opts.credentials = "omit";
        setUsedToken(token);
      } else {
        opts.credentials = "include";
        opts.headers = headers;
        setUsedToken(null);
      }
      async function tryFetch(url: string) {
        setUsedUrl(url);
        if (typeof window !== "undefined") console.debug("fetching", url, opts);
        const r = await fetch(url, opts);
        setStatus(r.status);
        return r;
      }
  // Primary endpoint (sesuai permintaan user): /pelamar
  let res = await tryFetch(`${BASE}/pelamar`);
      if (!res.ok) {
        try {
          const alt = BASE.includes("127.0.0.1") ? BASE.replace(/127\.0\.0\.1/g, "localhost") : BASE.replace(/localhost/g, "127.0.0.1");
          if (alt !== BASE) {
            if (typeof window !== "undefined") console.debug("retrying with alternate base", alt);
            res = await tryFetch(`${alt}/pelamar`);
      }
      // Jika unauthorized khusus siswa atau kosong, coba fallback endpoint /pelamar/mine jika ada
      if ((res.status === 401 || res.status === 403) || (res.ok && !await (async ()=>{ try { const clone = res.clone(); const js = await clone.json().catch(()=>null); const items = js && js.data ? js.data : js; return Array.isArray(items) && items.length > 0; } catch { return false; } })())) {
        try {
          res = await tryFetch(`${BASE}/pelamar/mine`);
        } catch {}
          }
        } catch {}
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "(no body)");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }
      const body = await res.json().catch(() => null);
      const items = body && body.data ? body.data : body;
      setData(Array.isArray(items) ? items : []);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setError(msg);
      if (typeof window !== "undefined") console.error("useMyApplications error:", msg);
      setData([]);
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  }, [USE_API, BASE]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Dengarkan event agar tabel otomatis refresh setelah siswa melamar
  useEffect(() => {
    const handler = () => { fetchData(); };
    window.addEventListener(APPLICATION_SUBMITTED_EVENT, handler);
    return () => window.removeEventListener(APPLICATION_SUBMITTED_EVENT, handler);
  }, [fetchData]);

  return { loading, error, data, status, usedToken, usedUrl, refetch: fetchData };
}

export default useMyApplications;

// Utility untuk mengirim lamaran baru dan memicu refresh otomatis tabel
export async function submitApplication(lowonganId: string | number, payload: Record<string, any> = {}) {
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  // Ambil token siswa (mirip logic di atas agar konsisten)
  let token =
    localStorage.getItem("access_token_siswa") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("auth_token");
  if (!token) {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        token = parsed?.access_token || parsed?.token || parsed?.accessToken || parsed?.auth_token || null;
      }
    } catch {}
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = JSON.stringify({ lowongan_id: lowonganId, ...payload });
  const res = await fetch(`${BASE}/pelamar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
    credentials: token ? 'omit' : 'include'
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '(no body)');
    throw new Error(`Gagal mengirim lamaran: HTTP ${res.status} ${txt}`);
  }
  const data = await res.json().catch(() => null);
  // Broadcast event supaya useMyApplications refetch
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('application-submitted'));
  }
  return data;
}
