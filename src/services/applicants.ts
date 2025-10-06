import type { Applicant } from "@/types/pelamar";
import { getAuthToken, TOKEN_KEYS } from "@/lib/authToken";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

// Raw backend shapes
export type BackendPelamarRecord = {
  id: number;
  status_lamaran: string;
  tanggal_lamaran?: string;
  siswa?: {
    id: number;
    nama_lengkap?: string;
    nisn?: string;
    kelas?: number | string;
    email?: string;
    jurusan?: string;
    asal_sekolah?: string;
    no_hp?: string;
    alamat?: string;
    foto_url?: string;
  };
  lowongan?: {
    id: number;
    judul_lowongan?: string;
    posisi?: string;
  };
  cv_url?: string;
  transkrip_url?: string;
};

export type PerusahaanPelamarResponse = {
  status_filter: string | null;
  search: string | null;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  data: BackendPelamarRecord[];
};

export async function fetchApplicants(
  params: { page?: number; perPage?: number; posisiId?: string; status?: string } = {}
): Promise<PerusahaanPelamarResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("per_page", String(params.perPage));
  if (params.posisiId) query.set("posisi_id", params.posisiId);
  if (params.status) query.set("status", params.status);

  const url = `${BASE}/perusahaan/pelamar${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    const token = getAuthToken();
    const r = await fetch(url, {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // Network reachable but HTTP error
    if (!r.ok) {
      if (r.status === 401) {
        const hasAny = TOKEN_KEYS.some(k => typeof window !== 'undefined' && localStorage.getItem(k));
        if (!hasAny) {
          console.warn('[Applicants] 401 unauthorized: tidak ada token tersimpan di localStorage. Keys dicek:', TOKEN_KEYS);
        } else {
          console.warn('[Applicants] 401 unauthorized: token ada tapi ditolak. Periksa apakah token benar guard perusahaan.');
        }
      }
      let detail = "";
      try {
        const txt = await r.text();
        detail = txt.slice(0, 400);
      } catch {}
      throw new Error(`Gagal memuat pelamar: HTTP ${r.status}${detail ? ` - ${detail}` : ""}`);
    }

    const body = await r.json().catch(() => ({}));
    if (body && body.data && body.pagination) return body as PerusahaanPelamarResponse;
    // Fallback minimal shape
    return {
      status_filter: null,
      search: null,
      pagination: {
        current_page: Number(params.page ?? 1),
        per_page: Number(params.perPage ?? 10),
        total: Array.isArray(body?.data) ? body.data.length : 0,
        last_page: 1,
      },
      data: Array.isArray(body?.data) ? (body.data as BackendPelamarRecord[]) : [],
    };
  } catch (err: any) {
    // Distinguish probable CORS / network
    const msg = err?.message || String(err);
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      throw new Error(
        `Tidak bisa terhubung ke server (${url}). Kemungkinan: server mati / CORS / base URL salah. Detail asli: ${msg}`
      );
    }
    throw err;
  }
}
