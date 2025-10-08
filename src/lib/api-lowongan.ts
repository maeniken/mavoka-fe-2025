import axios from "axios";
import { mapApiLowonganToClient, Lowongan } from "@/types/lowongan";
import type { CreateLowonganPayload } from "@/types/lowongan";

const API_BASE_URL =
  `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/lowongan`;

export async function TampilAllLowongan() {
  const res = await axios.get(`${API_BASE_URL}/all-lowongan`);
  const payload = res.data;
  // Backend sekarang bisa kirim {data: [...]} atau langsung array lama
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return list;
}

export async function getLowonganPerusahaan(): Promise<Lowongan[]> {
  const token = localStorage.getItem("access_token_perusahaan");
  const res = await axios.get(`${API_BASE_URL}/lowongan-perusahaan`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // mapping supaya frontend dapat versi rapih
  return res.data.map((item: any) => mapApiLowonganToClient(item));
}

// ===== UI-only mode helpers (sementara) =====
export async function getLowonganByIdClient(id: number): Promise<Lowongan | null> {
  const all = await getLowonganPerusahaan();
  return all.find((x) => Number(x.id) === Number(id)) ?? null;
}

export async function mockSubmit(_payload?: unknown, _note?: string): Promise<void> {
  // simulasi submit sukses: delay 600ms
  await new Promise((r) => setTimeout(r, 600));
  // tidak ada efek ke server. Hanya untuk memicu modal dan redirect.
}

// ================= UPDATE LOWONGAN (AUTH PERUSAHAAN) =================
// Backend expects status in: 'aktif' | 'tidak'
type UpdateStatus = 'aktif' | 'tidak';

function buildServerPayload(payload: CreateLowonganPayload, opts?: { status?: UpdateStatus }) {
  const body: Record<string, any> = {};
  const add = (key: string, val: any) => {
    if (val === undefined) return;
    if (typeof val === 'string' && val.trim() === '') return; // omit empty strings
    body[key] = val;
  };

  // Only include non-empty fields; keep kuota if it's a valid number (including 0)
  if (typeof payload.kuota === 'number' && !Number.isNaN(payload.kuota)) {
    body['kuota'] = payload.kuota;
  }
  add('judul_lowongan', payload.judul_lowongan);
  add('posisi', payload.posisi);
  add('deskripsi', payload.deskripsi);
  add('lokasi_penempatan', payload.lokasi_penempatan);

  // Dates: include only if provided (avoid empty strings which break 'date' validation)
  if (payload.deadline_lamaran) add('deadline_lamaran', payload.deadline_lamaran);
  if (payload.mulaiMagang) add('periode_awal', payload.mulaiMagang);
  if (payload.selesaiMagang) add('periode_akhir', payload.selesaiMagang);

  // Text lists: include only when non-empty
  if (Array.isArray(payload.tugas) && payload.tugas.length > 0) {
    // Backend expects a string; send JSON string so the model cast('array') works
    add('tugas_tanggung_jawab', JSON.stringify(payload.tugas));
  }
  if (Array.isArray(payload.persyaratan) && payload.persyaratan.length > 0) {
    add('persyaratan', payload.persyaratan.join('\n'));
  }
  if (Array.isArray(payload.keuntungan) && payload.keuntungan.length > 0) {
    add('benefit', payload.keuntungan.join('\n'));
  }

  if (opts?.status) body['status'] = opts.status;
  return body;
}

export async function updateLowongan(
  id: number,
  payload: CreateLowonganPayload,
  opts?: { status?: UpdateStatus }
): Promise<void> {
  const token = localStorage.getItem("access_token_perusahaan");
  const body = buildServerPayload(payload, opts);
  await axios.post(`${API_BASE_URL}/update-lowongan/${id}`,
    body,
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function updateLowonganDraft(id: number, payload: CreateLowonganPayload): Promise<void> {
  // Simpan sebagai Nonaktif (draft)
  return updateLowongan(id, payload, { status: 'tidak' });
}

export async function updateLowonganTerpasang(id: number, payload: CreateLowonganPayload): Promise<void> {
  // Pastikan status aktif/buka agar terlihat sebagai "Aktif"
  return updateLowongan(id, payload, { status: 'aktif' });
}

// Activate a lowongan with minimal payload (status + optional dates)
export async function aktifkanLowongan(
  id: number,
  data: { mulaiMagang?: string; selesaiMagang?: string; deadline_lamaran?: string }
): Promise<void> {
  const token = localStorage.getItem('access_token_perusahaan');
  // Only include provided values; omit empties
  const body: Record<string, any> = { status: 'aktif' };
  if (data.deadline_lamaran) body.deadline_lamaran = data.deadline_lamaran;
  if (data.mulaiMagang) body.periode_awal = data.mulaiMagang;
  if (data.selesaiMagang) body.periode_akhir = data.selesaiMagang;
  await axios.post(`${API_BASE_URL}/update-lowongan/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ================= CREATE LOWONGAN (AUTH PERUSAHAAN) =================
export async function createLowongan(
  payload: CreateLowonganPayload,
  opts?: { status?: 'aktif' | 'tidak' }
): Promise<void> {
  const token = localStorage.getItem('access_token_perusahaan');

  // Basic client-side guard for required fields (backend will also validate)
  const required: Array<[string, any]> = [
    ['judul_lowongan', payload.judul_lowongan?.trim()],
    ['deskripsi', payload.deskripsi?.trim()],
    ['posisi', payload.posisi?.trim()],
    ['kuota', typeof payload.kuota === 'number' && !Number.isNaN(payload.kuota) ? payload.kuota : undefined],
    ['lokasi_penempatan', payload.lokasi_penempatan?.trim()],
    ['deadline_lamaran', payload.deadline_lamaran?.trim()],
    ['mulaiMagang', payload.mulaiMagang?.trim()],
    ['selesaiMagang', payload.selesaiMagang?.trim()],
    ['persyaratan', Array.isArray(payload.persyaratan) ? payload.persyaratan : undefined],
    ['keuntungan', Array.isArray(payload.keuntungan) ? payload.keuntungan : undefined],
  ];
  const missing = required.filter(([_, v]) => v === undefined || v === '' || (Array.isArray(v) && v.length === 0)).map(([k]) => k);
  if (missing.length > 0) {
    throw new Error(`Harap lengkapi field: ${missing.join(', ')}`);
  }

  const body: Record<string, any> = {
    judul_lowongan: payload.judul_lowongan,
    deskripsi: payload.deskripsi,
    posisi: payload.posisi,
    kuota: payload.kuota,
    lokasi_penempatan: payload.lokasi_penempatan,
    persyaratan: JSON.stringify(payload.persyaratan),
    benefit: JSON.stringify(payload.keuntungan),
    tugas_tanggung_jawab: payload.tugas && payload.tugas.length > 0 ? JSON.stringify(payload.tugas) : null,
    status: opts?.status ?? 'aktif',
    deadline_lamaran: payload.deadline_lamaran,
    periode_awal: payload.mulaiMagang,
    periode_akhir: payload.selesaiMagang,
  };

  await axios.post(`${API_BASE_URL}/create-lowongan`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createLowonganDraft(payload: CreateLowonganPayload): Promise<void> {
  return createLowongan(payload, { status: 'tidak' });
}

export async function createLowonganAktif(payload: CreateLowonganPayload): Promise<void> {
  return createLowongan(payload, { status: 'aktif' });
}