//"use client";
//import { useState, useEffect } from "react";
//import ProfileHeader from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileHeader";
//import ProfileAvatar from "@/app/components//pengaturan-profil/data-akun/ProfileAvatar";
//import ProfileView from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileView";
//import ProfileForm from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileForm";
//import { getSiswaProfile, updateSiswaProfile } from "@/services/siswa";
//import { INDONESIA_PROVINCES } from '@/data/indonesia-regions';
//import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

//interface FormState {
//  fullName: string;
//  profilePic: string; // dataURL or existing URL/path
//  email: string;
//  gender: string;
//  birthDate: string;
//  phone: string; // maps to kontak
//  address: string; // alamat
//  city: string; // not yet persisted (backend belum dukung)
//  province: string; // not yet persisted
//}

//// Parse alamat yang mungkin sudah berisi kota & provinsi digabung.
//// Heuristik: cari provinsi valid dari belakang, elemen sebelum provinsi dianggap kota.
//const PROVINCE_SET = new Set(INDONESIA_PROVINCES);
//function parseCombinedAddress(raw: string): { address: string; city: string; province: string } {
//  if (!raw) return { address: '', city: '', province: '' };
//  const parts = raw.split(',').map(p => p.trim()).filter(p => p.length > 0);
//  if (parts.length === 0) return { address: '', city: '', province: '' };
//  // Scan dari belakang mencari provinsi yang cocok
//  let province = '';
//  let city = '';
//  let addrParts: string[] = parts.slice();
//  for (let i = parts.length - 1; i >= 0; i--) {
//    if (PROVINCE_SET.has(parts[i])) {
//      province = parts[i];
//      addrParts = parts.slice(0, i); // everything before province candidate
//      // city candidate = last of addrParts if exists and not too long
//      if (addrParts.length > 0) {
//        city = addrParts[addrParts.length - 1];
//        addrParts = addrParts.slice(0, -1);
//      }
//      break;
//    }
//  }
//  return {
//    address: addrParts.join(', ').trim(),
//    city,
//    province,
//  };
//}

//function buildCombinedAddress(address: string, city: string, province: string) {
//  const parts = [address, city, province].map(p => (p || '').trim()).filter(p => p.length > 0);
//  return parts.join(', ');
//}

//export default function DataDiriPage() {
//  const [isEditing, setIsEditing] = useState(false);
//  const [saving, setSaving] = useState(false);
//  const [message, setMessage] = useState<string|null>(null);
//  const [error, setError] = useState<string|null>(null);
//  const [loading, setLoading] = useState(true);
//  const [avatarFile, setAvatarFile] = useState<File | null>(null);
//  const [form, setForm] = useState<FormState>({
//    fullName: "",
//    profilePic: "",
//    email: "",
//    gender: "",
//    birthDate: "",
//    phone: "",
//    address: "",
//    city: "",
//    province: "",
//  });

//  // Keep original server data to diff
//  const [original, setOriginal] = useState<Partial<FormState>>({});

//  // Load profile from backend
//  useEffect(() => {
//    let cancelled = false;
//    (async () => {
//      try {
//        setLoading(true);
//        const profile = await getSiswaProfile();
//        if (cancelled) return;
//        // Jika alamat sudah gabungan, coba parse untuk prefill city & province
//        const parsed = parseCombinedAddress(profile.alamat || '');
//        const mapped: FormState = {
//          fullName: profile.nama_lengkap || profile.username || "User",
//          email: profile.email || "",
//          gender: profile.jenis_kelamin || "",
//          birthDate: profile.tanggal_lahir || "",
//          phone: profile.kontak || profile.no_hp || "",
//          address: parsed.address || profile.alamat || "",
//          city: profile.kota || parsed.city || "",
//          province: profile.provinsi || parsed.province || "",
//          profilePic: profile.foto_profil_url || profile.foto_profil || profile.foto || "",
//        };
//        setForm(mapped);
//        setOriginal(mapped);
//        // sync localStorage user minimal fields
//        try {
//          const raw = localStorage.getItem('user');
//          const existing = raw ? JSON.parse(raw) : {};
//          localStorage.setItem('user', JSON.stringify({ ...existing, nama_lengkap: mapped.fullName, email: mapped.email, jenis_kelamin: mapped.gender, tanggal_lahir: mapped.birthDate, kontak: mapped.phone, alamat: mapped.address, foto: mapped.profilePic }));
//        } catch {}
//      } catch (e: any) {
//        if (!cancelled) setError(e?.message || 'Gagal memuat profil');
//      } finally {
//        if (!cancelled) setLoading(false);
//      }
//    })();
//    return () => { cancelled = true; };
//  }, []);

//  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//    setForm({ ...form, [e.target.name]: e.target.value });
//  };

//  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//    const file = e.target.files?.[0];
//    if (!file) return;
//    setAvatarFile(file);
//    const reader = new FileReader();
//    reader.onload = () => {
//      setForm(f => ({ ...f, profilePic: reader.result as string }));
//    };
//    reader.readAsDataURL(file);
//  };

//  const handleSave = async () => {
//    setSaving(true);
//    setMessage(null);
//    setError(null);
//    try {
//      // Build payload only with changed fields to minimize validation collisions
//      const changed: any = {};
//      if (form.fullName !== original.fullName) changed.nama_lengkap = form.fullName;
//      if (form.gender !== original.gender) changed.jenis_kelamin = form.gender;
//      if (form.birthDate !== original.birthDate) changed.tanggal_lahir = form.birthDate;
//      if (form.phone !== original.phone) changed.kontak = form.phone;
//      // Gabungkan address + city + province menjadi satu field alamat untuk disimpan
//      const combinedNow = buildCombinedAddress(form.address, form.city, form.province);
//      const originalCombined = buildCombinedAddress(original.address || '', original.city || '', original.province || '');
//      if (combinedNow !== originalCombined) {
//        changed.alamat = combinedNow;
//      }
//      // province & city currently not supported in backend -> skip
//      if (avatarFile) {
//        changed.fotoFile = avatarFile;
//      } else if (form.profilePic && form.profilePic.startsWith('data:') && form.profilePic !== original.profilePic) {
//        changed.foto_base64 = form.profilePic;
//      }

//      if (Object.keys(changed).length === 0) {
//        setMessage('Tidak ada perubahan');
//        setIsEditing(false);
//        return;
//      }

//      const updated = await updateSiswaProfile(changed);
//      // Update localStorage & state
//      try {
//        const raw = localStorage.getItem('user');
//        const existing = raw ? JSON.parse(raw) : {};
//        localStorage.setItem('user', JSON.stringify({ ...existing, nama_lengkap: updated.nama_lengkap, email: updated.email, jenis_kelamin: updated.jenis_kelamin, tanggal_lahir: updated.tanggal_lahir, kontak: updated.kontak, alamat: updated.alamat, foto: updated.foto_profil || updated.foto }));
//      } catch {}
//  // After successful save, store combined address as base address reference
//  setOriginal(o => ({ ...o, ...form, address: buildCombinedAddress(form.address, form.city, form.province) }));
//      setMessage('Perubahan tersimpan');
//      setIsEditing(false);
//      setAvatarFile(null);
//    } catch (e: any) {
//      setError(e?.message || 'Gagal menyimpan perubahan');
//    } finally {
//      setSaving(false);
//      setTimeout(()=> setMessage(null), 4000);
//    }
//  };

//  // Early return saat loading untuk menghindari konten lain menambah tinggi & memunculkan scrollbar
//  if (loading) {
//    return (
//      <>
//        <ProfileHeader onEdit={() => setIsEditing(true)} />
//        <div className="flex items-center justify-center h-[calc(100vh-6rem)] max-h-[calc(100vh-6rem)] overflow-hidden">
//          <LoadingSpinner size={64} label="Memuat profil..." labelPosition="below" styleType="dashed" />
//        </div>
//      </>
//    );
//  }

//  return (
//    <>
//      <ProfileHeader onEdit={() => setIsEditing(true)} />
//      {error && <p className="text-sm text-red-600 mb-4 whitespace-pre-wrap">{error}</p>}
//      <div className="flex flex-col items-center gap-2 mb-4">
//        <ProfileAvatar src={form.profilePic} name={form.fullName || "User"} />
//        {isEditing && (
//          <label className="text-xs text-blue-600 cursor-pointer hover:underline">
//            Ganti Foto
//            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
//          </label>
//        )}
//      </div>

//      {!isEditing && !loading && <ProfileView form={form} />}

//      {isEditing && (
//        <>
//          <ProfileForm form={form} handleChange={handleChange} />
//          <div className="flex justify-end gap-3 mt-6">
//            <button
//              type="button"
//              onClick={() => setIsEditing(false)}
//              className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
//            >
//              Batal
//            </button>
//            <button
//              type="button"
//              onClick={handleSave}
//              disabled={saving}
//              className="px-4 py-2 rounded bg-[#0F67B1] text-white hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
//            >
//              {saving ? 'Menyimpan...' : 'Simpan'}
//            </button>
//          </div>
//        </>
//      )}
//      {message && <p className="text-xs mt-4 text-center text-gray-600">{message}</p>}
//    </>
//  );
//}


"use client";
import { useState, useEffect, useRef } from "react";
import ProfileHeader from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileHeader";
import ProfileAvatar from "@/app/components/pengaturan-profil/data-akun/ProfileAvatar";
import ProfileForm from "@/app/components/dashboard/siswa/pengaturan/data-diri/ProfileForm";
import { getSiswaProfile, updateSiswaProfile } from "@/services/siswa";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

interface FormState {
  fullName: string;
  profilePic: string;
  email: string;
  gender: string;
  birthDate: string;
  phone: string;
  address: string;
}

export default function DataDiriPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    profilePic: "",
    email: "",
    gender: "",
    birthDate: "",
    phone: "",
    address: "",
  });

  const [original, setOriginal] = useState<FormState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const pendingAvatarRef = useRef<File | null>(null);
  const previousPreviewUrlRef = useRef<string | null>(null);

  // Load profile
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const profile = await getSiswaProfile();
        if (cancelled) return;

        const mapped: FormState = {
          fullName: profile.nama_lengkap || profile.username || "User",
          email: profile.email || "",
          gender: profile.jenis_kelamin || "",
          birthDate: profile.tanggal_lahir || "",
          phone: profile.kontak || profile.no_hp || "",
          address: profile.alamat || "",
          profilePic: profile.foto_profil_url || profile.foto_profil || profile.foto || "",
        };
        setForm(mapped);
        setOriginal(mapped);
      } catch (e: any) {
        setError(e?.message || "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (previousPreviewUrlRef.current) {
        try { URL.revokeObjectURL(previousPreviewUrlRef.current); } catch {}
      }
      cancelled = true;
    };
  }, []);

  // Input change -> langsung editable
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  // Avatar change
  const handleAvatarChange = (file: File) => {
    if (previousPreviewUrlRef.current) {
      try { URL.revokeObjectURL(previousPreviewUrlRef.current); } catch {}
    }
    const url = URL.createObjectURL(file);
    previousPreviewUrlRef.current = url;
    pendingAvatarRef.current = file;
    setForm((prev) => ({ ...prev, profilePic: url }));
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (original) setForm(original);
    pendingAvatarRef.current = null;
    if (previousPreviewUrlRef.current) {
      try { URL.revokeObjectURL(previousPreviewUrlRef.current); } catch {}
      previousPreviewUrlRef.current = null;
    }
    setIsDirty(false);
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!original) return;
    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      const changed: any = {};
      if (form.email !== original.email) changed.email = form.email;
      if (form.gender !== original.gender) changed.jenis_kelamin = form.gender;
      if (form.birthDate !== original.birthDate) changed.tanggal_lahir = form.birthDate;
      if (form.phone !== original.phone) changed.kontak = form.phone;
      if (form.address !== original.address) changed.alamat = form.address;

      if (pendingAvatarRef.current) {
        changed.fotoFile = pendingAvatarRef.current;
      } else if (form.profilePic.startsWith("data:") && form.profilePic !== original.profilePic) {
        changed.foto_base64 = form.profilePic;
      }

      if (Object.keys(changed).length === 0) {
        setMessage("Tidak ada perubahan");
        setIsDirty(false);
        return;
      }

      const updated = await updateSiswaProfile(changed);

      // sinkron state & original
      const nextOriginal: FormState = {
        ...form,
        profilePic: updated.foto_profil || updated.foto || form.profilePic,
      };
      setOriginal(nextOriginal);
      setIsDirty(false);
      setMessage("Perubahan tersimpan");

      pendingAvatarRef.current = null;
      if (previousPreviewUrlRef.current) {
        try { URL.revokeObjectURL(previousPreviewUrlRef.current); } catch {}
        previousPreviewUrlRef.current = null;
      }
    } catch (e: any) {
      setError(e?.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  if (loading) {
    return (
      <>
        <ProfileHeader />
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <LoadingSpinner size={64} label="Memuat profil..." labelPosition="below" styleType="dashed" />
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileHeader />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {/* Avatar (klik untuk ganti) */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <ProfileAvatar
          src={form.profilePic}
          name={form.fullName || "User"}
          onEdit={async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e: any) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 2 * 1024 * 1024) {
                setError("Ukuran foto maks 2MB");
                return;
              }
              handleAvatarChange(f);
            };
            input.click();
          }}
        />
      </div>

      {/* Form: hanya field yang diminta */}
      <ProfileForm form={form} handleChange={handleChange} />

      {isDirty && (
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-md bg-white text-[#0F67B1] border border-[#0F67B1]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md bg-[#0F67B1] text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      )}

      {message && <p className="text-xs mt-4 text-center text-gray-600">{message}</p>}
    </>
  );
}
