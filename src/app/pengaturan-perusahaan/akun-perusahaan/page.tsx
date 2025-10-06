
"use client";
import { useState, useEffect } from "react";
import AkunHeader from "@/app/components/pengaturan-profil/akun/AkunHeader";
import AkunView from "@/app/components/pengaturan-profil/akun/AkunView";
import ChangePasswordFlow from "@/app/components/pengaturan-profil/akun/ChangePasswordFlow";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { getAccount } from "@/services/account";
import { extractUsernameFromAny } from "@/lib/extractUsername";

export default function AkunPage() {
  const [activeTab, setActiveTab] = useState("akun");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "••••••••", // Placeholder untuk password
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const idCandidate = parsed?.id ?? parsed?.user?.id ?? parsed?.user_id ?? null;
        if (idCandidate) setUserId(Number(idCandidate));
      } catch (e) {
        console.error("Gagal parse user:", e);
      }
    }
  }, []);

  // Fetch account data from API
  useEffect(() => {
    const fetchAccountData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const data = await getAccount('perusahaan', userId);

        if (process.env.NODE_ENV !== 'production') {
          console.debug('[AkunPerusahaanPage] raw account data', data);
        }

        // Coba ekstrak langsung dari objek API
        let apiUsername = extractUsernameFromAny(data);
        // Beberapa backend menaruh payload sebenarnya di field data/data atau perusahaan
        if (!apiUsername && (data as any).perusahaan) {
          apiUsername = extractUsernameFromAny((data as any).perusahaan);
        }

        // Fallback ke cache sebelumnya (localStorage) bila API belum kirim username
        let cached: string | null = null;
        try { cached = localStorage.getItem('perusahaan_username'); } catch {}

        // Fallback ke objek user sebelumnya bila tersedia
        if (!apiUsername) {
          try {
            const raw = localStorage.getItem('user');
            if (raw) {
              const parsed = JSON.parse(raw);
              apiUsername = parsed?.username || apiUsername;
            }
          } catch {}
        }

        const normalizedUsername =
          typeof apiUsername === 'string'
            ? apiUsername
            : (apiUsername && typeof (apiUsername as any).username === 'string'
                ? (apiUsername as any).username
                : '');
        const finalUsername = (normalizedUsername.trim()) || cached || 'Belum diatur';

        // Cache kalau sudah valid
        if (finalUsername && finalUsername !== 'Belum diatur') {
          try { localStorage.setItem('perusahaan_username', finalUsername); } catch {}
        } else if (process.env.NODE_ENV !== 'production') {
          console.warn('[AkunPerusahaanPage] Username belum ditemukan di API; menggunakan placeholder / cache.');
        }

        setForm(prev => ({
          ...prev,
            username: finalUsername,
            email: data.email || '',
            password: '••••••••'
        }));

      } catch (err: any) {
        console.error('Fetch account data error:', err);
        showToast(err.message || 'Gagal memuat data akun', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [userId]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <AkunHeader />
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner 
            size={48} 
            label="Memuat data akun..." 
            labelPosition="below"
            variant="primary"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {activeTab === "akun" && (
        <>
          <AkunHeader />
          {!isEditing && (
            <AkunView
              form={form}
              setForm={setForm}
              onChangePassword={() => setIsEditing(true)}
              onShowToast={showToast}
              userId={userId}
              role="perusahaan"
            />
          )}
          {isEditing && (
            <ChangePasswordFlow role="perusahaan" onCancel={() => setIsEditing(false)} />
          )}
        </>
      )}
      
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded shadow-md text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
