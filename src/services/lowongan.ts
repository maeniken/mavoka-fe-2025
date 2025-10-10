import api from "@/lib/axios";
import { Lowongan, mapApiLowonganToClient } from "@/types/lowongan";

/**
 * Ambil lowongan berdasarkan ID
 */
export async function getLowonganById(
  id: string | number
): Promise<Lowongan | null> {
  try {
    const res = await api.get(`/api/lowongan/show-lowongan/${id}`);

    // response bisa berbentuk { data: {...} } atau langsung object
    const payload = res.data?.data ?? res.data ?? null;
    if (!payload) return null;

    // mapping ke versi client
    return mapApiLowonganToClient(payload);
  } catch (err) {
    console.error("getLowonganById error:", err);
    return null;
  }
}

/**
 * Ambil semua lowongan lalu filter berdasarkan perusahaan_id (hanya status aktif/buka)
 */
export async function getLowonganByPerusahaan(perusahaanId: string | number): Promise<Lowongan[]> {
  try {
    const res = await api.get(`/api/lowongan/all-lowongan`);
    const payload = res.data?.data ?? [];
    if (!Array.isArray(payload)) return [];
    const filtered = payload.filter((row: any) => String(row.perusahaan_id) === String(perusahaanId));
    const aktifOnly = filtered.filter((row: any) => String(row.status).toLowerCase() === 'aktif');
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[getLowonganByPerusahaan] total:', payload.length, 'perusahaan match:', filtered.length, 'aktif:', aktifOnly.length);
    }
    return aktifOnly
      .map(mapApiLowonganToClient)
      .sort((a: Lowongan, b: Lowongan) => new Date(a.deadline_lamaran).getTime() - new Date(b.deadline_lamaran).getTime());
  } catch (err) {
    console.error("getLowonganByPerusahaan error:", err);
    return [];
  }
}
