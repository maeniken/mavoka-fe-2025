"use client";
import { useState, useEffect } from "react";
import ProfileHeader from "@/app/components/pengaturan-profil/data-akun/ProfileHeader";
import ProfileAvatar from "@/app/components/pengaturan-profil/data-akun/ProfileAvatar";
import TampilProfil from "@/app/components/pengaturan-profil/data-akun/TampilProfil";
import { LoadingSpinner, OverlayLoader } from "@/app/components/ui/LoadingSpinner";

type Role = "sekolah" | "perusahaan" | "lpk";

export default function ProfilePage() {
  const [role, setRole] = useState<Role>("perusahaan");
  const [form, setForm] = useState({
    nama_perusahaan: "Perusahaan XYZ",
    profilePic: "",
    bidang_usaha: "Teknologi",
    deskripsi_usaha: "Perusahaan yang bergerak di bidang teknologi",
    email: "perusahaanxyz@gmail.com",
    phone: "0821345566",
    website: "perusahaanxyz.com",
    address: "Gamping",
    penanggung_jawab: "Lele",
    tanda_tangan: '',
  });
  const [isDirty, setIsDirty] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) setRole(parsed.role as Role);
        // try to detect id from several common shapes
        const idCandidate = parsed?.id ?? parsed?.user?.id ?? parsed?.user_id ?? null;
        if (idCandidate) setUserId(Number(idCandidate));
      } catch (e) {
        console.error("Gagal parse user:", e);
      }
    }
  }, []);

  // Fetch perusahaan data from API when we have userId
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
      const apiRoot = `${API_BASE.replace(/\/+$/g, '')}/api`;

      const stored = localStorage.getItem('user');
      let parsed: any = null;
      if (stored) {
        try { parsed = JSON.parse(stored); } catch (e) { /* ignore */ }
      }
      const tokenCandidates = [localStorage.getItem('token'), localStorage.getItem('access_token'), localStorage.getItem('access_token_sekolah'), parsed?.token, parsed?.access_token];
      const token = tokenCandidates.find((t:any) => typeof t === 'string' && t?.length > 0) || null;

      try {
        const url = `${apiRoot}/user/${role}/${userId}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          console.warn('Gagal ambil data perusahaan:', res.status, res.statusText);
          return;
        }
        const data = await res.json();
        // Map backend fields to frontend form shape
        setForm({
          nama_perusahaan: data.nama_perusahaan ?? '',
          profilePic: data.logo_url ?? data.logo_perusahaan ?? '',
          bidang_usaha: data.bidang_usaha ?? '',
          deskripsi_usaha: data.deskripsi_usaha ?? '',
          email: data.email ?? '',
          phone: data.kontak ?? '',
          website: data.web_perusahaan ?? data.website ?? '',
          address: data.alamat ?? '',
          penanggung_jawab: data.penanggung_jawab ?? '',
          tanda_tangan: data.tanda_tangan_url ?? data.tanda_tangan ?? '',
        });
        setIsDirty(false);
      } catch (err) {
        console.error('fetch perusahaan error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, role]);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

  // Show loading spinner while fetching initial data
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <ProfileHeader role={role} />
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner 
            size={48} 
            label="Memuat data profil..." 
            labelPosition="below"
            variant="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <ProfileHeader role={role} />

      <div className="flex justify-center mb-6">
        <ProfileAvatar
          src={form.profilePic}
          name={
            form.nama_perusahaan
          }
          onEdit={async () => {
            if (!userId) {
              showToast('User ID tidak tersedia', 'error');
              return;
            }
            // create hidden file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e: any) => {
              const f = e.target.files?.[0];
              if (!f) return;
              
              setUploadingLogo(true);
              try {
                // stage the file for later upload and show preview
                const preview = URL.createObjectURL(f);
                setPendingLogoFile(f);
                setForm((prev) => ({ ...prev, profilePic: preview }));
                setIsDirty(true);
              } catch (error) {
                showToast('Gagal memproses file logo', 'error');
              } finally {
                setUploadingLogo(false);
              }
            };
            // trigger file picker
            input.click();
          }}
        />
      </div>

      <TampilProfil
        role={role}
        form={form}
        handleChange={handleChange}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
        onSaveAll={async () => {
          // send update to backend
          if (!userId) {
            showToast('User ID tidak tersedia', 'error');
            return;
          }
          
          setSavingProfile(true);
          
          const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
          const apiRoot = `${API_BASE.replace(/\/+$/g, '')}/api`;
          const stored = localStorage.getItem('user');
          let parsed: any = null;
          if (stored) {
            try { parsed = JSON.parse(stored); } catch(e){}
          }
          const tokenCandidates = [localStorage.getItem('token'), localStorage.getItem('access_token'), localStorage.getItem('access_token_sekolah'), parsed?.token, parsed?.access_token];
          const token = tokenCandidates.find((t:any) => typeof t === 'string' && t?.length > 0) || null;

          const payload: any = {
            nama_perusahaan: form.nama_perusahaan,
            deskripsi_usaha: form.deskripsi_usaha,
            alamat: form.address,
            kontak: form.phone,
            web_perusahaan: form.website,
            penanggung_jawab: form.penanggung_jawab,
          };
          if (form.tanda_tangan && !/^blob:|^data:/i.test(form.tanda_tangan)) {
            payload.tanda_tangan = form.tanda_tangan;
          }

          try {
            // If a pending logo file exists, upload it first
            if (pendingLogoFile) {
              const formData = new FormData();
              formData.append('logo_perusahaan', pendingLogoFile);
              const urlUpload = `${apiRoot}/user/update-akun/${role}/${userId}`;
              const resUpload = await fetch(urlUpload, {
                method: 'POST',
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
              });
              if (!resUpload.ok) {
                const txt = await resUpload.json().catch(() => null);
                showToast(txt?.message ?? `Upload logo gagal: ${resUpload.status}`, 'error');
                return;
              }
              const dataUpload = await resUpload.json().catch(() => null);
              if (dataUpload?.data) {
                const u = dataUpload.data;
                setForm((prev) => ({ ...prev, profilePic: (u.logo_perusahaan_url ?? u.logo_perusahaan) || prev.profilePic }));
              }
              // clear pending file after successful upload
              setPendingLogoFile(null);
            }

            // now update textual profile fields
            const url = `${apiRoot}/user/update-akun/${role}/${userId}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(payload),
            });
            if (!res.ok) {
              const txt = await res.json().catch(() => null);
                showToast(txt?.message ?? `Update gagal: ${res.status}`, 'error');
              return;
            }
            showToast('Profil berhasil disimpan', 'success');
            setIsDirty(false);
          } catch (err) {
            console.error('save profile error', err);
            showToast('Gagal menyimpan profil', 'error');
          }
        }}
        onUploadSignature={async (file: File) => {
          if (!userId) {
            showToast('User ID tidak tersedia', 'error');
            return '';
          }
          const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
          const apiRoot = `${API_BASE.replace(/\/+$/g, '')}/api`;
          const stored = localStorage.getItem('user');
          let parsed: any = null;
          if (stored) {
            try { parsed = JSON.parse(stored); } catch(e){}
          }
          const tokenCandidates = [localStorage.getItem('token'), localStorage.getItem('access_token'), localStorage.getItem('access_token_sekolah'), parsed?.token, parsed?.access_token];
          const token = tokenCandidates.find((t:any) => typeof t === 'string' && t?.length > 0) || null;

          const formData = new FormData();
          formData.append('tanda_tangan', file);

          try {
            const url = `${apiRoot}/user/update-akun/${role}/${userId}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: formData,
            });
            if (!res.ok) {
              const txt = await res.json().catch(() => null);
              showToast(txt?.message ?? `Upload tanda tangan gagal: ${res.status}`, 'error');
              return '';
            }
            const data = await res.json().catch(() => null);
            // Cari path/url di beberapa kemungkinan struktur
            let finalPath = '';
            if (data) {
              const candidateLayers: any[] = [];
              if (data.data && typeof data.data === 'object') candidateLayers.push(data.data);
              candidateLayers.push(data); // root level juga diuji
              for (const layer of candidateLayers) {
                if (!layer) continue;
                const cand = layer.tanda_tangan_url || layer.tanda_tangan || layer.path || layer.url;
                if (typeof cand === 'string' && cand.trim()) { finalPath = cand.trim(); break; }
              }
            }
            if (finalPath) {
              setForm((prev) => ({ ...prev, tanda_tangan: finalPath }));
              showToast('Tanda tangan berhasil diunggah', 'success');
            } else {
              showToast('Upload tanda tangan selesai (path tidak ditemukan di response)', 'success');
            }
            return finalPath;
            setIsDirty(false);
          } catch (err) {
            console.error('upload signature error', err);
            showToast('Gagal mengunggah tanda tangan', 'error');
            return '';
          }
        }}
        onShowToast={showToast}
      />
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded shadow-md text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
