import { requireRoleAuthHeader, resolveRoleId } from '@/lib/auth-storage';

export interface SiswaProfile {
  id: number;
  nama_lengkap?: string;
  email?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  no_hp?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  foto?: string;
  [k: string]: any;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// Generic account update via /user/update-akun/{role}/{id}
export interface UpdateAccountPayload {
  username?: string;
  email?: string;
  password?: string;
  nama_lengkap?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  kontak?: string;
  fotoFile?: File;
  foto_base64?: string;
  [k: string]: any;
}

function appendOptional(form: FormData, key: string, value: any) {
  if (value === undefined || value === null) return;
  if (typeof value === 'string' && value.length === 0) return; // skip empty string to keep optional truly optional
  form.append(key, value);
}

export async function updateAccount(role: 'siswa'|'sekolah'|'perusahaan'|'lpk', id: number, payload: UpdateAccountPayload) {
  const headers = requireRoleAuthHeader(role); // do not set content-type manually
  const form = new FormData();
  const directKeys = ['username','email','password','nama_lengkap','tanggal_lahir','jenis_kelamin','alamat','kontak'];
  directKeys.forEach(k => {
    if (payload[k] !== undefined && payload[k] !== null && payload[k] !== '') form.append(k, payload[k]);
  });

  // foto
  if (payload.fotoFile instanceof File && payload.fotoFile.size > 0) {
    form.append('foto_profil', payload.fotoFile);
  } else if (payload.foto_base64 && /^data:image\/(png|jpe?g|gif);base64,/.test(payload.foto_base64)) {
    const f = dataURLtoFile(payload.foto_base64, 'foto_profil.png');
    if (f && f.size > 0) form.append('foto_profil', f);
  }

  const res = await fetch(`${BASE_URL}/user/update-akun/${role}/${id}`, {
    method: 'POST',
    headers,
    body: form,
  });
  let json: any = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) {
    const errDetail = json?.errors ? JSON.stringify(json.errors) : json?.message || res.statusText;
    throw new Error('Gagal update akun: ' + errDetail);
  }
  return json?.data || json?.akun || json;
}

export async function getSiswaProfile(id?: number): Promise<SiswaProfile> {
  const siswaId = id ?? resolveRoleId('siswa');
  if (!siswaId) throw new Error('ID siswa tidak ditemukan (belum login?)');
  const headers = requireRoleAuthHeader('siswa');
  const res = await fetch(`${BASE_URL}/siswa/${siswaId}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error('Gagal mengambil profil siswa');
  const data = await res.json();
  return data?.data || data; // backend mungkin wrap di data
}

export interface UpdateSiswaPayload {
  nama_lengkap?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  alamat?: string;
  kontak?: string; // mapping from phone
  password?: string;
  username?: string;
  email?: string;
  foto_base64?: string; // we will convert to file if possible
  fotoFile?: File; // optional direct file
}

function dataURLtoFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  } catch { return null; }
}

// Backward compatible helper using new unified endpoint
export async function updateSiswaProfile(payload: UpdateSiswaPayload, id?: number): Promise<SiswaProfile> {
  const siswaId = id ?? resolveRoleId('siswa');
  if (!siswaId) throw new Error('ID siswa tidak ditemukan (belum login?)');
  const res = await updateAccount('siswa', siswaId, payload);
  return res;
}
