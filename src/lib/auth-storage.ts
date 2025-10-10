export type Role = "siswa" | "sekolah" | "perusahaan" | "lpk" | "admin";

const isClient = () => typeof window !== "undefined";

/** Ambil token per-role PADA SAAT DIPANGGIL (jangan di module-scope) */
export function requireRoleAuthHeader(role: Role) {
  if (!isClient()) throw new Error("requireRoleAuthHeader only on client");
  const token = localStorage.getItem(`access_token_${role}`); // contoh: access_token_lpk
  if (!token) {
    // fallback lama kalau ada
    const legacy = localStorage.getItem("token");
    if (legacy) {
      console.warn(`[auth] token role ${role} tidak ada, fallback ke 'token' umum (tidak disarankan)`);
      return { Accept: "application/json", Authorization: `Bearer ${legacy}` };
    }
    throw new Error(`Token ${role} tidak ditemukan. Login sebagai ${role} dulu.`);
  }
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
}

/** Ambil id per-role, kalau perlu dipakai di payload */
export function resolveRoleId(role: Role): number | null {
  if (!isClient()) return null;
  const v = localStorage.getItem(`id_${role}`);
  if (v && !Number.isNaN(Number(v))) return Number(v);

  // legacy fallback yang sering dipakai
  const alt = role === "sekolah" ? "sekolah_id"
           : role === "lpk" ? "lpk_id"
           : role === "perusahaan" ? "perusahaan_id"
           : role === "siswa" ? "siswa_id" : "";
  const lv = alt ? localStorage.getItem(alt) : null;
  if (lv && !Number.isNaN(Number(lv))) return Number(lv);

  // dari actor {role,id}
  try {
    const actor = JSON.parse(localStorage.getItem("actor") || "null");
    const id = actor?.role === role ? actor?.id : null;
    const n = typeof id === "string" ? Number(id) : id;
    return typeof n === "number" && !Number.isNaN(n) ? n : null;
  } catch { return null; }
}

/**
 * Hapus semua data autentikasi yang disimpan di localStorage.
 * Menghapus keys umum dan semua key yang dimulai dengan `access_token_` atau `id_`.
 */
export function clearAuth() {
  if (!isClient()) return;
  try {
    const removeExact = ["token", "user", "role", "actor", "login_at"];
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("access_token_") || k.startsWith("id_")) {
        localStorage.removeItem(k);
      }
    }
    for (const k of removeExact) localStorage.removeItem(k);
  } catch (e) {
    console.warn("clearAuth failed", e);
  }
}

/**
 * Periksa apakah sesi sudah melewati timeout (default 1 jam).
 * Mengembalikan true jika sesi sudah expired atau tidak ada timestamp.
 */
export function isSessionExpired(timeoutMs = 1000 * 60 * 60): boolean {
  if (!isClient()) return true;
  const raw = localStorage.getItem("login_at");
  if (!raw) return true;
  const at = Number(raw);
  if (Number.isNaN(at)) return true;
  return Date.now() - at >= timeoutMs;
}
