
"use client";
import { useState, useEffect } from "react";
import AkunHeader from "@/app/components/dashboard/siswa/pengaturan/akun/AkunHeader";
import AkunView from "@/app/components/dashboard/siswa/pengaturan/akun/AkunView";
import ChangePasswordFlow from "@/app/components/dashboard/siswa/pengaturan/akun/ChangePasswordFlow";
import { getAccount, updateAccount } from "@/services/account";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function AkunPage() {
  const [activeTab, setActiveTab] = useState("akun");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    username: "",
    email: "",
    password: "", // not fetched (placeholder)
    role: "siswa"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  // Ambil role & id dari localStorage (fallback siswa)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : 'siswa';
        const role = (storedRole || 'siswa').toLowerCase() as any;
        // id di localStorage user
        let id: number | null = null;
        try {
          const raw = localStorage.getItem('user');
          if (raw) {
            const u = JSON.parse(raw);
            id = Number(u.id || u.user_id || u.siswa_id || u.sekolah_id || u.perusahaan_id || u.lpk_id) || null;
          }
        } catch {}
        if (!id) throw new Error('ID akun tidak ditemukan di penyimpanan lokal');
        const akun = await getAccount(role, id);
        if (cancelled) return;
        setForm(f => ({ ...f, id, role, username: akun.username || akun.nama_lengkap || '', email: akun.email || '' }));
      } catch (e: any) {
        console.error('[AkunPage] load error', e);
        if (!cancelled) setError(e?.message || 'Gagal memuat data akun');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleUsernameSave(newUsername: string) {
    if (!newUsername || newUsername === form.username) return;
    setSavingUsername(true);
    try {
      const updated = await updateAccount(form.role as any, form.id, { username: newUsername });
      setForm(f => ({ ...f, username: updated.username || newUsername }));
      // update localStorage user
      try {
        const raw = localStorage.getItem('user');
        const existing = raw ? JSON.parse(raw) : {};
        localStorage.setItem('user', JSON.stringify({ ...existing, username: updated.username || newUsername }));
      } catch {}
    } catch (e: any) {
      alert(e?.message || 'Gagal memperbarui username');
    } finally {
      setSavingUsername(false);
    }
  }

  return (
    <>
      {activeTab === "akun" && (
        <>
          <AkunHeader />
          {loading && (
            <div className="py-10 flex justify-center">
              <LoadingSpinner size={50} label="Memuat akun..." labelPosition="below" styleType="dashed" />
            </div>
          )}
          {error && !loading && (
            <p className="text-sm text-red-600 mb-4 whitespace-pre-wrap">{error}</p>
          )}
          {!loading && !error && !isEditing && (
            <AkunView
              form={form}
              setForm={data => setForm(data)}
              onChangePassword={() => setIsEditing(true)}
            />
          )}
          {isEditing && (
            <ChangePasswordFlow onCancel={() => setIsEditing(false)} />
          )}
        </>
      )}
    </>
  );
}
