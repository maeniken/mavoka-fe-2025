import api from "@/lib/axios";
import { School, Jurusan } from "@/types/school";

export type SchoolRaw = {
  id?: number | string;
  nama_sekolah?: string;
  alamat?: string;
  jenis?: string | null;
  web_sekolah?: string | null;
  email?: string | null;
  npsn?: string | null;
  logo_sekolah?: string | null;
  logo_url?: string | null;
  slug?: string;
  jurusan?: { id: number; sekolah_id: number; nama_jurusan: string }[];
};

function extractSchoolPayload(res: any): SchoolRaw | undefined {
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

export async function getSchoolById(id: string | number): Promise<School | null> {
  try {
    const res = await api.get(`/api/user/sekolah/${id}`);
    const r = extractSchoolPayload(res) as SchoolRaw | undefined;
    if (!r) return null;

    const logoAbsolute = r.logo_url
      ? r.logo_url
      : r.logo_sekolah
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")}/${r.logo_sekolah.replace(/^\//,'')}`
        : null;

    const school: School = {
      id: r.id ?? id,
      name: r.nama_sekolah ?? "Sekolah",
      address: r.alamat ?? "-",
      type: r.jenis ?? null,
      website: r.web_sekolah ?? null,
      email: r.email ?? null,
      npsn: r.npsn ?? null,
      logoUrl: logoAbsolute,
      slug: r.slug,
      jurusan: r.jurusan ?? [],
    };

    return school;
  } catch (err) {
    console.error("getSchoolById error:", err);
    return null;
  }
}

// Ambil jurusan (array string / array nama) dari endpoint /api/sekolah/jurusan/{id}
// Backend mengembalikan bentuk: { sekolah_id, nama_sekolah, jurusan: ["RPL","TKJ"], count }
// Kita normalisasi menjadi Jurusan[] dengan id incremental lokal agar cocok dengan UI yang mengharapkan key id.
export async function getJurusanBySekolah(id: string | number): Promise<Jurusan[]> {
  try {
    const res = await api.get(`/api/sekolah/jurusan/${id}`);
    const data = res?.data;
    if (!data) return [];
    const list: string[] = Array.isArray(data.jurusan) ? data.jurusan : [];
    return list.map((nama, idx) => ({ id: idx + 1, sekolah_id: Number(id), nama_jurusan: nama }));
  } catch (err) {
    console.error("getJurusanBySekolah error:", err);
    return [];
  }
}

// Ambil semua sekolah (ringkas) untuk marquee / listing logo
export async function getAllSekolah(): Promise<Pick<School, 'id' | 'name' | 'logoUrl'>[]> {
  try {
    const res = await api.get('/api/sekolah/all-sekolah');
    const payload = res?.data ?? res;
    let arr: any[] = [];
    if (Array.isArray(payload)) arr = payload;
    else if (Array.isArray(payload.data)) arr = payload.data;
    else if (Array.isArray(payload.data?.data)) arr = payload.data.data;

    const base = (process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

    return arr.map(item => {
      let logo = item.logo_url || item.logo_sekolah || null;
      if (logo && !/^https?:\/\//i.test(logo)) {
        logo = base + '/' + String(logo).replace(/^\//,'');
      }
      return {
        id: item.id,
        name: item.nama_sekolah ?? 'Sekolah',
        logoUrl: logo,
      };
    });
  } catch (e) {
    console.error('[getAllSekolah] error', e);
    return [];
  }
}
