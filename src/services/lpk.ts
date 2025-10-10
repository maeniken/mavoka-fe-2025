import api from "@/lib/axios";
import { Lpk, LpkRaw } from "@/types/lpk";

function extractLpkPayload(res: any): LpkRaw | undefined {
  if (!res) return undefined;
  const payload = res.data ?? res;
  if (!payload) return undefined;

  if (Array.isArray(payload)) return payload[0];
  if (Array.isArray(payload.data)) return payload.data[0];
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }
  return payload;
}

export async function getLpkById(id: string): Promise<Lpk | null> {
  try {
    const res = await api.get(`/api/user/lpk/${id}`);
    const r = extractLpkPayload(res) as LpkRaw | undefined;
    if (!r) return null;

    // Simpan raw path untuk builder (jangan langsung paksa base karena logic fallback di komponen)
    const rawLogo = r.logo_lembaga ?? r.logo_url ?? null;
    let logo = rawLogo;
    if (logo && /^https?:\/\//i.test(logo)) {
      // biarkan apa adanya (absolute)
    } else if (logo) {
      // tidak langsung digabung base di sini; komponen akan menyusun kandidat
    }

    const lpk: Lpk = {
      id: r.id ?? id,
      name: r.nama_lembaga ?? "Lembaga Pelatihan",
      address: r.alamat ?? "-",
      web_lembaga: r.web_lembaga ?? null,
      email: r.email ?? "-",
      deskripsi_lembaga: r.deskripsi_lembaga ?? null,
      bidang_pelatihan: r.bidang_pelatihan ?? null,
  logoUrl: logo, // bisa relative atau absolute
  logoRaw: rawLogo ?? null,
      coverUrl: r.cover_url ?? null,
      slug: r.slug,
      username: (r as any).username ?? null,
    };

    return lpk;
  } catch (err) {
    console.error("getLpkById error:", err);
    return null;
  }
}

// Ambil semua LPK (ringkas) dari endpoint publik /api/lpk/all
export async function getAllLpk(): Promise<Lpk[]> {
  try {
    const res = await api.get('/api/lpk/all');
    const payload = res.data ?? res;
    let arr: any[] = [];
    if (Array.isArray(payload)) arr = payload;
    else if (Array.isArray(payload.data)) arr = payload.data;
    else if (Array.isArray(payload.data?.data)) arr = payload.data.data; // kemungkinan paginated

  // base disiapkan jika kita butuh normalisasi cepat utk absolute; namun kita pertahankan raw untuk builder di komponen
  const base = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000').replace(/\/$/, '');
    return arr.map(item => {
      const rawLogo = item.logo_lembaga || item.logo_url || item.logo || null;
      let logo = rawLogo;
      if (logo && /^https?:\/\//i.test(logo)) {
        // absolute OK
      } else if (logo) {
        // tetap biarkan relative di sini; builder akan mencoba berbagai pola
      }
      const mapped: Lpk = {
        id: item.id,
        name: item.nama_lembaga ?? 'Lembaga Pelatihan',
        address: item.alamat ?? '-',
        bidang_pelatihan: item.bidang_pelatihan ?? null,
        logoUrl: logo,
        logoRaw: rawLogo ?? null,
        slug: item.slug,
        web_lembaga: item.web_lembaga ?? null,
        deskripsi_lembaga: item.deskripsi_lembaga ?? null,
        email: item.email ?? undefined,
        username: item.username ?? null,
      };
      return mapped;
    });
  } catch (e) {
    console.error('[getAllLpk] error', e);
    return [];
  }
}

// Endpoint publik alternatif (asumsi): /api/lpk/{id}
export async function getPublicLpkById(id: string | number): Promise<Lpk | null> {
  try {
    const res = await api.get(`/api/lpk/${id}`);
    const raw = res.data?.data || res.data || res;
    if (!raw) return null;
    const rawLogo = raw.logo_lembaga || raw.logo_url || raw.logo || null;
    const mapped: Lpk = {
      id: raw.id ?? id,
      name: raw.nama_lembaga ?? 'Lembaga Pelatihan',
      address: raw.alamat ?? '-',
      web_lembaga: raw.web_lembaga ?? null,
      bidang_pelatihan: raw.bidang_pelatihan ?? null,
      deskripsi_lembaga: raw.deskripsi_lembaga ?? null,
      logoUrl: rawLogo,
      logoRaw: rawLogo,
      coverUrl: raw.cover_url ?? null,
      slug: raw.slug,
      email: raw.email ?? undefined,
      username: raw.username ?? null,
    };
    return mapped;
  } catch (e) {
    console.warn('[getPublicLpkById] gagal', e);
    return null;
  }
}
