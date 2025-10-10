"use client";
import { useState, useEffect, useCallback } from "react";
import ProfileHeader from "@/app/components/pengaturan-profil/data-akun/ProfileHeader";
import ProfileAvatar from "@/app/components/pengaturan-profil/data-akun/ProfileAvatar";
import TampilProfil from "@/app/components/pengaturan-profil/data-akun/TampilProfil";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { getAccount } from "@/services/account";
import { extractUsernameFromAny } from "@/lib/extractUsername";

// Helper to build auth header from various stored tokens
function buildAuthHeader(): Record<string,string> | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = localStorage.getItem('user');
  let parsed: any = null;
  if (stored) { try { parsed = JSON.parse(stored); } catch {} }
  const candidates = [
    localStorage.getItem('token'),
    localStorage.getItem('access_token'),
    localStorage.getItem('access_token_lpk'),
    parsed?.token,
    parsed?.access_token,
    parsed?.accessToken,
  ];
  const token = candidates.find(t => typeof t === 'string' && t.length > 0);
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

type Role = "sekolah" | "perusahaan" | "lpk" | "siswa";

export default function DataLpkPage() {
  const [role, setRole] = useState<Role>("lpk");
  const [form, setForm] = useState<any>({
    nama_lembaga: '',
    profilePic: '',
    bidang_pelatihan: '',
    deskripsi_lembaga: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    akreditasi: '',
    dokumen_akreditasi: '', // raw path returned
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState<{message:string; type:'success'|'error'}|null>(null);

  const showToast = (message: string, type: 'success'|'error', ttl=3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), ttl);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setRole(parsed.role as Role);
        const idCandidate = parsed?.id ?? parsed?.user?.id ?? parsed?.user_id;
        if (idCandidate) setUserId(Number(idCandidate));
      } catch (e) {
        console.error("Gagal parse user:", e);
      }
    }
  }, []);

  // Fetch LPK account data
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const data = await getAccount('lpk', userId);
        const uname = extractUsernameFromAny(data) || data.username || null;
        if (uname && typeof window !== 'undefined') {
          const unameStr =
            typeof uname === 'string'
              ? uname
              : (uname as any)?.username && typeof (uname as any).username === 'string'
                ? (uname as any).username
                : null;
          if (unameStr) {
            try { localStorage.setItem('lpk_username', unameStr); } catch {}
          }
        }
        // Backend returns fields: nama_lembaga, bidang_pelatihan, deskripsi_lembaga, email, kontak, web_lembaga, alamat, status_akreditasi, logo_lembaga
        setForm((prev: any) => ({
          ...prev,
            nama_lembaga: data.nama_lembaga || '',
            bidang_pelatihan: data.bidang_pelatihan || '',
            deskripsi_lembaga: data.deskripsi_lembaga || '',
            email: data.email || '',
            phone: data.kontak || '',
            website: data.web_lembaga || '',
            address: data.alamat || '',
            akreditasi: data.status_akreditasi || '',
            profilePic: data.logo_lembaga || '',
            dokumen_akreditasi: data.dokumen_akreditasi || '',
        }));
      } catch (err: any) {
        console.error('Load LPK error', err);
        showToast(err.message || 'Gagal memuat data LPK', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // Save all (editable subset) handler
  const saveProfile = useCallback(async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
      const apiRoot = `${API_BASE.replace(/\/+$/g, '')}/api`;
      const headers = { ...(buildAuthHeader() || {} ) } as any;
      // Use FormData for potential file fields
      const fd = new FormData();
      // Map FE fields -> BE fields
      if (form.deskripsi_lembaga !== undefined) fd.append('deskripsi_lembaga', form.deskripsi_lembaga || '');
      if (form.phone !== undefined) fd.append('kontak', form.phone || '');
      if (form.address !== undefined) fd.append('alamat', form.address || '');
      if (form.akreditasi !== undefined) fd.append('status_akreditasi', form.akreditasi || '');
      // Logo: if it's a File object we attach; if data URL maybe convert later (skip for now) – detection
      if (form.profilePic instanceof File) {
        fd.append('logo_lembaga', form.profilePic);
      }
      // Upload dokumen akreditasi file if present
      if (form.dokumenFile instanceof File) {
        fd.append('dokumen_akreditasi', form.dokumenFile);
      }
      const res = await fetch(`${apiRoot}/user/update-akun/lpk/${userId}` , {
        method: 'POST',
        headers,
        body: fd,
      });
      let json: any = null; try { json = await res.json(); } catch {}
      if (!res.ok) {
        const msg = json?.message || res.statusText;
        throw new Error(msg);
      }
      const updated = json?.data || json;
      setForm((prev: any) => ({
        ...prev,
        deskripsi_lembaga: updated.deskripsi_lembaga || prev.deskripsi_lembaga,
        phone: updated.kontak || prev.phone,
        address: updated.alamat || prev.address,
        akreditasi: updated.status_akreditasi || prev.akreditasi,
        profilePic: updated.logo_lembaga || prev.profilePic,
        dokumen_akreditasi: updated.dokumen_akreditasi || prev.dokumen_akreditasi,
      }));
      showToast('Profil berhasil diperbarui', 'success');
      setIsDirty(false);
    } catch (err: any) {
      console.error('Save LPK error', err);
      showToast(err.message || 'Gagal menyimpan perubahan', 'error');
    } finally {
      setSaving(false);
    }
  }, [userId, form]);

  // Upload file akreditasi (dipicu via custom UI - kita tambahkan di bawah avatar)
  const handleAkreditasiFile = (file: File) => {
    setForm((prev: any) => ({ ...prev, dokumenFile: file }));
    setIsDirty(true);
  };

  const handleAvatarEdit = () => {
    const input = document.getElementById('lpk_logo_input') as HTMLInputElement | null;
    if (input) input.click();
  };

  const handleLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/png','image/jpeg','image/jpg','image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Tipe file logo tidak didukung', 'error');
      return;
    }
    if (file.size > 2*1024*1024) {
      showToast('Ukuran logo > 2MB', 'error');
      return;
    }
    setForm((prev: any) => ({ ...prev, profilePic: file }));
    setIsDirty(true);
  };

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setForm((prev: any) => ({ ...prev, [name]: value }));
  setIsDirty(true);
};

  return (
    <div className="bg-white p-6 rounded-lg shadow relative">
      {toast && (
        <div className={`absolute top-4 right-4 px-4 py-2 rounded text-white shadow ${toast.type==='success' ? 'bg-green-600':'bg-red-600'}`}>{toast.message}</div>
      )}
      <ProfileHeader role={role} />
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size={48} label="Memuat profil LPK..." labelPosition="below" variant="primary" />
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center mb-6">
            <ProfileAvatar
              src={typeof form.profilePic === 'string' ? form.profilePic : (form.profilePic ? URL.createObjectURL(form.profilePic) : '')}
              name={form.nama_lembaga || 'Lembaga'}
              onEdit={handleAvatarEdit}
            />
            <input id="lpk_logo_input" type="file" accept="image/*" className="hidden" onChange={handleLogoSelected} />
          </div>

          {/* Form profil reuse */}
          <TampilProfil 
            role={role === 'siswa' ? 'lpk' : role}
            form={form}
            handleChange={handleChange}
            isDirty={isDirty}
            setIsDirty={setIsDirty}
            onSaveAll={saveProfile}
            onShowToast={(m,t) => showToast(m,t)}
            hideFields={['akreditasi']}
            hideSaveButtons
          />

          {/* Akreditasi upload section */}
          <div className="mt-6">
            <label className="block text-sm font-semibold mb-2">Dokumen Akreditasi</label>
            <div className="rounded-lg border border-[#0F67B1]/60 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Preview */}
              <div className="w-full sm:w-auto flex items-center gap-4">
                {(() => {
                  const raw = form.dokumen_akreditasi;
                  const pending = form.dokumenFile;
                  const fileName = pending?.name || (typeof raw === 'string' ? raw.split('/').pop() : '');
                  if (pending) {
                    if (/application\/pdf/i.test(pending.type)) {
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 flex items-center justify-center rounded bg-white border">
                            <span className="text-[10px] font-semibold text-red-600">PDF</span>
                          </div>
                          <div className="text-xs font-medium text-gray-800 max-w-[180px] truncate">{fileName}</div>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 flex items-center justify-center rounded bg-white border overflow-hidden">
                          <img src={URL.createObjectURL(pending)} alt="preview" className="object-cover max-h-14" />
                        </div>
                        <div className="text-xs font-medium text-gray-800 max-w-[180px] truncate">{fileName}</div>
                      </div>
                    );
                  }
                  if (raw && typeof raw === 'string' && raw.trim().length) {
                    const lower = raw.toLowerCase();
                    const isPdf = /\.pdf($|\?)/.test(lower);
                    const directUrl = raw.startsWith('http') ? raw : `${(process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000'}/storage/${raw.replace(/^storage\//,'')}`;
                    if (isPdf) {
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 flex items-center justify-center rounded bg-white border">
                            <span className="text-[10px] font-semibold text-red-600">PDF</span>
                          </div>
                          <a href={directUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 underline max-w-[180px] truncate">{fileName || 'dokumen-akreditasi.pdf'}</a>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 flex items-center justify-center rounded bg-white border overflow-hidden">
                          <img src={directUrl} alt={fileName || 'dokumen'} className="object-cover max-h-14" />
                        </div>
                        <a href={directUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 underline max-w-[180px] truncate">{fileName || 'dokumen-akreditasi'}</a>
                      </div>
                    );
                  }
                  return <div className="text-xs text-gray-500">Belum ada dokumen terunggah</div>;
                })()}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-3 ml-auto">
                <input
                  id="dokumen_akreditasi_input"
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 5*1024*1024) { showToast('Ukuran file > 5MB','error'); return;} handleAkreditasiFile(f); }}
                />
                <label htmlFor="dokumen_akreditasi_input" className="cursor-pointer bg-[#0F67B1] text-white text-xs px-4 py-2 rounded shadow hover:bg-[#0d5694] transition">
                  {form.dokumen_akreditasi || form.dokumenFile ? 'Ganti File' : 'Pilih File'}
                </label>
                {form.dokumen_akreditasi && !form.dokumenFile && (
                  <button type="button" className="text-[11px] text-red-600 hover:underline" onClick={() => { setForm((p:any)=>({...p, dokumen_akreditasi:'', dokumenFile: null})); setIsDirty(true); }}>Hapus</button>
                )}
              </div>
            </div>
            <p className="mt-2 text-[10px] text-gray-500">Format: PDF / JPG / PNG. Maks 5MB.</p>
          </div>

          {isDirty && (
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" disabled={saving} onClick={() => { setIsDirty(false); }} className="px-4 py-2 border rounded text-[#0F67B1] border-[#0F67B1] bg-white disabled:opacity-50">Batal</button>
              <button type="button" disabled={saving} onClick={saveProfile} className="px-4 py-2 rounded bg-[#0F67B1] text-white flex items-center gap-2 disabled:opacity-60">
                {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
                {saving ? 'Menyimpan...' : 'Simpan '}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
