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
