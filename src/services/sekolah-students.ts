import { requireRoleAuthHeader, resolveRoleId } from '@/lib/auth-storage';
import type { StudentRow } from '@/types/unggah-data-siswa';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export type ListSiswaResponse = {
  filters: {
    jurusan: string | null;
    tahun: string | null;
    status: 'Semua' | 'Aktif' | 'Tidak';
    search: string | null;
  };
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  data: Array<StudentRow & { raw?: any }>;
};

export async function fetchSiswaBySekolah(params: {
  sekolahId?: number;
  jurusan?: string;
  tahun?: string;
  status?: 'Semua' | 'Aktif' | 'Tidak';
  search?: string;
  page?: number;
  perPage?: number;
}): Promise<ListSiswaResponse> {
  const sekolahId = params.sekolahId ?? resolveRoleId('sekolah');
  if (!sekolahId) throw new Error('ID sekolah tidak ditemukan. Pastikan sudah login sebagai sekolah.');

  const headers = requireRoleAuthHeader('sekolah');
  const qs = new URLSearchParams();
  if (params.jurusan) qs.set('jurusan', params.jurusan);
  if (params.tahun) qs.set('tahun', params.tahun);
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.perPage) qs.set('per_page', String(params.perPage));

  const url = `${BASE}/sekolah/${sekolahId}/siswa${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`Gagal memuat data siswa: HTTP ${res.status}${detail ? ' - ' + detail : ''}`);
  }
  const json = await res.json();
  // fallback minimal if structure differ
  if (json?.data && json?.pagination) return json as ListSiswaResponse;
  return {
    filters: {
      jurusan: params.jurusan ?? null,
      tahun: params.tahun ?? null,
      status: (params.status as any) ?? 'Semua',
      search: params.search ?? null,
    },
    pagination: {
      current_page: params.page ?? 1,
      per_page: params.perPage ?? 10,
      total: Array.isArray(json?.data) ? json.data.length : 0,
      last_page: 1,
    },
    data: Array.isArray(json?.data) ? json.data : [],
  };
}

export type LamaranSiswaItem = {
  id: number;
  nama_lengkap: string;
  nisn: string;
  kelas: number | string | null;
  jurusan: string | null;
  jumlah_lamaran: number;
  lamaran: {
    lowongan_id: number;
    nama_lowongan: string | null;
    status_lamaran: string;
    tanggal_lamaran: string | null;
  }[];
};

export type LamaranSiswaResponse = {
  filter_status: string | null;
  search: string | null;
  siswa_id?: number | null;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  data: LamaranSiswaItem[];
};

export async function fetchLamaranSiswaSekolah(params: {
  sekolahId?: number;
  status?: 'lamar' | 'wawancara' | 'penawaran' | 'ditolak' | 'diterima' | 'belum';
  search?: string;
  siswaId?: number;
  page?: number;
  perPage?: number;
}): Promise<LamaranSiswaResponse> {
  const sekolahId = params.sekolahId ?? resolveRoleId('sekolah');
  if (!sekolahId) throw new Error('ID sekolah tidak ditemukan. Pastikan sudah login sebagai sekolah.');
  const headers = requireRoleAuthHeader('sekolah');
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  if (params.siswaId) qs.set('siswa_id', String(params.siswaId));
  if (params.page) qs.set('page', String(params.page));
  if (params.perPage) qs.set('per_page', String(params.perPage));
  const url = `${BASE}/sekolah/lamaran-siswa/${sekolahId}${qs.toString() ? `?${qs.toString()}` : ''}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`Gagal memuat lamaran siswa: HTTP ${res.status}${detail ? ' - ' + detail : ''}`);
  }
  const json = await res.json();
  return json as LamaranSiswaResponse;
}

export async function fetchLamaranBySiswaId(siswaId: number, params?: {
  sekolahId?: number;
  status?: 'lamar' | 'wawancara' | 'penawaran' | 'ditolak' | 'diterima' | 'belum';
}): Promise<LamaranSiswaItem | null> {
  const resolved = params?.sekolahId ?? resolveRoleId('sekolah');
  const sekolahId = typeof resolved === 'number' ? resolved : undefined;
  const resp = await fetchLamaranSiswaSekolah({ sekolahId, siswaId, status: params?.status, perPage: 1, page: 1 });
  const item = Array.isArray(resp?.data) ? resp.data[0] : null;
  return item ?? null;
}
