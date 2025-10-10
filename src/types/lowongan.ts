export type Company = {
  id: number;
  username: string;
  email: string;
  status_verifikasi: string;
  tanggal_verifikasi: string;
  nama_perusahaan: string;
  bidang_usaha: string;
  web_perusahaan?: string | null;
  deskripsi_usaha?: string | null;
  alamat: string;
  kontak?: string | null;
  logo_perusahaan?: string | null;
  penanggung_jawab?: string | null;
  otp?: string | null;
  otp_expired_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type StatusLowongan = "Aktif" | "Nonaktif";

/**
 * Lowongan versi client (sudah dirapikan untuk frontend)
 */
export interface Lowongan {
  id: number;
  perusahaan_id: number;
  judul_lowongan: string;
  posisi: string;
  deskripsi: string;
  kuota: number;
  lokasi_penempatan: string;
  persyaratan: string[];
  keuntungan: string[];
  tugas: string[];
  mulaiMagang?: string | null;
  selesaiMagang?: string | null;
  deadline_lamaran: string;
  created_at: string;
  updated_at: string;
  status: StatusLowongan;
  perusahaan?: Company;
}

function normalizeDelimited(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String).map(v => v.trim()).filter(v => v.length > 0);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    // Kalau JSON array dalam bentuk string
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map(String).map(v => v.trim()).filter(v => v.length > 0);
        }
      } catch {/* ignore */}
    }
    // Split berdasarkan newline, koma, atau titik koma
    return trimmed.split(/[\n;,]+/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}

export function mapApiLowonganToClient(apiData: any): Lowongan {
  return {
    id: apiData.id,
    perusahaan_id: apiData.perusahaan_id,
    judul_lowongan: apiData.judul_lowongan,
    posisi: apiData.posisi,
    deskripsi: apiData.deskripsi,
    kuota: Number(apiData.kuota ?? 0),
    lokasi_penempatan: apiData.lokasi_penempatan,
    persyaratan: normalizeDelimited(apiData.persyaratan),
    keuntungan: normalizeDelimited(apiData.benefit),
    tugas: normalizeDelimited(apiData.tugas_tanggung_jawab),
    mulaiMagang: apiData.periode_awal ?? null,
    selesaiMagang: apiData.periode_akhir ?? null,
    deadline_lamaran: apiData.deadline_lamaran,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at,
  status: ["buka","aktif"].includes(String(apiData.status).toLowerCase()) ? "Aktif" : "Nonaktif",
    perusahaan: apiData.perusahaan,
  };
}

/**
 * Payload ringan untuk create/update dari Form
 */
export type CreateLowonganPayload = {
  perusahaan_id: number;
  judul_lowongan: string;
  posisi: string;
  deskripsi: string;
  kuota: number;
  lokasi_penempatan: string;
  deadline_lamaran: string; // YYYY-MM-DD
  mulaiMagang?: string;      // YYYY-MM-DD
  selesaiMagang?: string;    // YYYY-MM-DD
  tugas: string[];
  persyaratan: string[];
  keuntungan: string[];
};
