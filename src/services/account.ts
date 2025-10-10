import { requireRoleAuthHeader, resolveRoleId } from '@/lib/auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export type GenericRole = 'siswa' | 'sekolah' | 'perusahaan' | 'lpk' | 'admin';

export interface AccountData {
  id: number;
  username?: string;
  email?: string;
  nama_lengkap?: string;
  role?: string;
  foto_profil?: string;
  foto?: string;
  [k: string]: any;
}

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

export async function getAccount(role: GenericRole, id?: number): Promise<AccountData> {
  const resolvedId = id ?? resolveRoleId(role);
  if (!resolvedId) throw new Error('ID akun tidak ditemukan untuk role ' + role);
  let headers: Record<string,string> | undefined;
  try {
    headers = requireRoleAuthHeader(role);
  } catch {
    // Token tidak wajib untuk endpoint publik; lanjut tanpa header
  }
  let res = await fetch(`${BASE_URL}/user/${role}/${resolvedId}`, { headers, cache: 'no-store' });
  // Jika unauthorized dan kita punya header bearer generik lama, coba fallback legacy token
  if (res.status === 401 && !headers) {
    const legacy = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (legacy) {
      res = await fetch(`${BASE_URL}/user/${role}/${resolvedId}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${legacy}` }, cache: 'no-store' });
    }
  }
  let json: any = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) {
    // Fallback: beberapa role mungkin tidak didukung oleh route /user/{role}/{id}, gunakan endpoint spesifik
    const invalidRole = res.status === 400 && /role/i.test(json?.message || '') && /invalid|tidak valid/i.test(json?.message || '');
    if (invalidRole) {
      const roleEndpointMap: Record<string,string> = {
        siswa: 'siswa',
        sekolah: 'sekolah',
        perusahaan: 'perusahaan',
        lpk: 'lpk'
      };
      const ep = roleEndpointMap[role];
      if (ep) {
        const altRes = await fetch(`${BASE_URL}/${ep}/${resolvedId}`, { headers, cache: 'no-store' });
        let altJson: any = null;
        try { altJson = await altRes.json(); } catch {}
        if (altRes.ok) {
          return altJson?.data || altJson;
        }
        // Jika fallback juga gagal, lanjut lempar error awal + detail fallback
        const altDetail = altJson?.message || altJson?.error || altRes.statusText;
        const detailCombined = `${json?.message || res.statusText} | fallback: ${altRes.status} ${altDetail}`;
        throw new Error(`Gagal mengambil akun (HTTP ${res.status}): ${detailCombined}`);
      }
    }
    const detail = json?.message || json?.error || JSON.stringify(json) || res.statusText;
    throw new Error(`Gagal mengambil akun (HTTP ${res.status}): ${detail}`);
  }
  return json?.data || json?.akun || json;
}

export async function verifyPassword(role: GenericRole, currentPassword: string): Promise<boolean> {
  let headers: Record<string,string> = { 'Accept': 'application/json' };
  try {
    const h = requireRoleAuthHeader(role);
    headers = { ...headers, ...h };
  } catch {
    // leave Accept only; caller should normally have token in localStorage
  }
  // ensure JSON content type so Laravel parses request()->json()
  headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}/user/verify-password/${role}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ current_password: currentPassword }),
    cache: 'no-store'
  });
  let json: any = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) {
    // Laravel validation (422) returns { errors: { field: ['msg'] } }
    if (res.status === 422 && json?.errors) {
      const firstField = Object.keys(json.errors)[0];
      const msg = Array.isArray(json.errors[firstField]) ? json.errors[firstField][0] : JSON.stringify(json.errors[firstField]);
      throw new Error(msg || 'Verifikasi password gagal (validasi)');
    }
    const message = json?.message || res.statusText || 'Verifikasi password gagal';
    throw new Error(message);
  }
  return true;
}

export async function updateAccount(role: GenericRole, id: number, payload: UpdateAccountPayload): Promise<AccountData> {
  const headers = requireRoleAuthHeader(role);
  const form = new FormData();
  const simpleKeys: (keyof UpdateAccountPayload)[] = ['username','email','password','nama_lengkap','tanggal_lahir','jenis_kelamin','alamat','kontak'];
  simpleKeys.forEach(k => {
    const v = payload[k];
    if (v !== undefined && v !== null && v !== '') form.append(k, v as any);
  });
  if (payload.fotoFile instanceof File) {
    form.append('foto_profil', payload.fotoFile);
  } else if (payload.foto_base64 && /^data:image\//.test(payload.foto_base64)) {
    const f = dataURLtoFile(payload.foto_base64, 'avatar.png');
    if (f) form.append('foto_profil', f);
  }
  const res = await fetch(`${BASE_URL}/user/update-akun/${role}/${id}`, { method: 'POST', headers, body: form });
  let json: any = null;
  try { json = await res.json(); } catch {}
  if (!res.ok) {
    const err = json?.errors ? JSON.stringify(json.errors) : json?.message || res.statusText;
    throw new Error('Gagal memperbarui akun: ' + err);
  }
  return json?.data || json?.akun || json;
}
