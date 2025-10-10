import axios from "axios";
import { Company, Job } from "@/types/company";

type RawCompany = {
  id?: number | string;
  nama_perusahaan?: string;
  name?: string;
  alamat?: string;
  address?: string;
  deskripsi_usaha?: string;
  logo_perusahaan?: string | null;
  logo_url?: string | null;
  slug?: string;
  email?: string;
  kontak?: string;
  web_perusahaan?: string;
  total_lowongan_aktif?: number;
  lowongan_aktif?: any[];
};

type RawLowongan = {
  id: number;
  perusahaan_id: number;
  judul_lowongan: string;
  posisi?: string;
  kuota?: number | string;
  lokasi_penempatan?: string;
  deadline_lamaran?: string;
  status: string; // aktif / tidak / draft (lama: buka / tutup)
  perusahaan?: {
    nama_perusahaan?: string;
    logo_perusahaan?: string | null;
    logo_url?: string | null;
  };
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000",
  timeout: 15000,
});

// Derive an API root that has no trailing /api segment so we can reliably
// build absolute URLs for storage assets (e.g. storage/..., /storage/...).
// Prefer NEXT_PUBLIC_API_BASE_URL, fallback to NEXT_PUBLIC_API_BASE, then a default
const API_BASE_ENV = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api';
const API_ROOT = API_BASE_ENV.replace(/\/?api\/?$/i, '').replace(/\/$/, '');

function normalizeAssetUrl(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim();
  // Allow absolute URLs and data/blob through as-is
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s;

  // Normalize slashes and remove leading '/'
  const cleaned = s.replace(/\\+/g, '/').replace(/^\/+/, '');

  // Public assets served under /logos/... should NOT be prefixed with /storage
  if (/^logos\//i.test(cleaned)) {
    return API_ROOT + '/' + cleaned; // -> <origin>/logos/...
  }

  // New pattern used when company edits logo: perusahaan/logo/<filename>
  // These are typically stored under the storage symlink
  if (/^(perusahaan|sekolah|lpk)\/logo\//i.test(cleaned)) {
    return API_ROOT + '/storage/' + cleaned; // -> <origin>/storage/perusahaan/logo/...
  }

  // Already a storage path (with or without leading slash)
  if (/^\/?storage\//i.test(s)) {
    const path = s.replace(/^\/+/, '');
    return API_ROOT + '/' + path; // -> <origin>/storage/...
  }

  // Fallback: assume under storage symlink
  return API_ROOT + '/storage/' + cleaned;
}

function extractCompanyPayload(res: any): RawCompany | undefined {
  if (!res) return undefined;
  const payload = res.data ?? res;
  if (!payload) return undefined;

  if (Array.isArray(payload)) return payload[0];
  if (Array.isArray(payload.data)) return payload.data[0];
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

function extractArrayPayload<T>(res: any): T[] {
  if (!res) return [];
  const payload = res.data ?? res;
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload.data)) return payload.data as T[];
  if (Array.isArray(payload.data?.data)) return payload.data.data as T[]; // extra nesting
  return [];
}

export async function getCompanyById(id: string | number): Promise<Company | null> {
  try {
    // Gunakan endpoint publik yang sudah distandardkan
    const res = await api.get(`/api/perusahaan/detail/${id}`);
    const r = extractCompanyPayload(res) as RawCompany | undefined;
    if (!r) return null;

    const lowRes = await api.get("/api/lowongan/all-lowongan");
    const allLowongan = extractArrayPayload<RawLowongan>(lowRes);

    const relatedLowongan = allLowongan.filter((l) => String(l.perusahaan_id) === String(r.id ?? id));
    const aktifLowongan = relatedLowongan.filter(l => String(l.status).toLowerCase() === 'aktif');
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[getCompanyById] totalAll:', allLowongan.length, 'matchCompany:', relatedLowongan.length, 'aktif:', aktifLowongan.length);
    }

  let totalLowongan = aktifLowongan.length;

  let logo = normalizeAssetUrl(r.logo_url ?? r.logo_perusahaan ?? undefined);

    // Normalisasi logo perusahaan juga untuk setiap lowongan terkait agar langsung siap dipakai JobCard
    // Use API_ROOT for normalization of any storage-relative paths
  let jobs: Job[] = aktifLowongan.map(l => {
  let rawLogo = l.perusahaan?.logo_url ?? l.perusahaan?.logo_perusahaan ?? logo;
  rawLogo = normalizeAssetUrl(rawLogo) ?? undefined;
      return {
        id: l.id,
        judul_lowongan: l.judul_lowongan,
        posisi: l.posisi ?? l.judul_lowongan,
        kuota: Number(l.kuota ?? 0),
        lokasi_penempatan: l.lokasi_penempatan ?? '-',
        deadline_lamaran: l.deadline_lamaran ?? '-',
        perusahaan: {
          nama_perusahaan: r.nama_perusahaan ?? r.name ?? 'Perusahaan',
          logo_perusahaan: rawLogo ?? null,
        }
      };
    });

    // Jika API detail perusahaan sudah include total_lowongan_aktif & lowongan_aktif gunakan itu sebagai sumber utama.
    const apiTotal = (r as any).total_lowongan_aktif;
    const apiJobsRaw = (r as any).lowongan_aktif;

    if (Array.isArray(apiJobsRaw)) {
      // Gunakan data langsung dari endpoint baru
      jobs = apiJobsRaw.map((l: any) => {
  let rawLogo = l.logo_url ?? l.logo_perusahaan ?? r.logo_perusahaan ?? logo;
  rawLogo = normalizeAssetUrl(rawLogo) ?? undefined;
        return {
          id: l.id,
            judul_lowongan: l.judul_lowongan,
            posisi: l.posisi ?? l.judul_lowongan,
            kuota: Number(l.kuota ?? 0),
            lokasi_penempatan: l.lokasi_penempatan ?? '-',
            deadline_lamaran: l.deadline_lamaran ?? '-',
            perusahaan: {
              nama_perusahaan: r.nama_perusahaan ?? r.name ?? 'Perusahaan',
              logo_perusahaan: rawLogo ?? null,
            }
        } as Job;
      });
      totalLowongan = typeof apiTotal === 'number' ? apiTotal : jobs.length;
    } else {
      // fallback ke mekanisme sebelumnya (allLowongan filtering)
      totalLowongan = relatedLowongan.length;
      jobs = relatedLowongan.map(l => {
  let rawLogo = l.perusahaan?.logo_url ?? l.perusahaan?.logo_perusahaan ?? logo;
  rawLogo = normalizeAssetUrl(rawLogo) ?? undefined;
        return {
          id: l.id,
          judul_lowongan: l.judul_lowongan,
          posisi: l.posisi ?? l.judul_lowongan,
          kuota: Number(l.kuota ?? 0),
          lokasi_penempatan: l.lokasi_penempatan ?? '-',
          deadline_lamaran: l.deadline_lamaran ?? '-',
          perusahaan: {
            nama_perusahaan: r.nama_perusahaan ?? r.name ?? 'Perusahaan',
            logo_perusahaan: rawLogo ?? null,
          }
        };
      });
    }

    const company: Company = {
      id: r.id ?? id,
      name: r.nama_perusahaan ?? r.name ?? "Perusahaan",
      address: r.alamat ?? r.address ?? "-",
  logoUrl: logo ?? null,
      slug: r.slug,
      description: r.deskripsi_usaha ?? "-",
      email: r.email ?? "-",
      contact: r.kontak ?? "-",
      web: r.web_perusahaan ?? undefined,
      totalLowongan,
      jobs,
    };

    return company;
  } catch (err) {
    console.error("getCompanyById error:", err);
    return null;
  }
}
