
"use client";
import { useEffect, useState, useCallback } from "react";
import AkunHeader from "@/app/components/pengaturan-profil/akun/AkunHeader";
import AkunView from "@/app/components/pengaturan-profil/akun/AkunView";
import ChangePasswordFlow from "@/app/components/pengaturan-profil/akun/ChangePasswordFlow";
import { getAccount } from "@/services/account";
import { getLpkById } from "@/services/lpk"; // remove public fallback to avoid 404 noise
import { extractUsernameFromAny } from "@/lib/extractUsername";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

// Prevent repetitive console warnings about missing username
let warnedMissingUsername = false;

interface FormState {
  username: string;
  email: string;
  password?: string; // not fetched directly; used only for display placeholder
}

export default function AkunLpkPage() {
  const [activeTab, setActiveTab] = useState("akun");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "-" // placeholder only
  });
  // Hindari hydration mismatch saat child komponen akses localStorage / window
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    let active = true;

    // (helper di-import sekarang)

    (async () => {
      try {
        setLoading(true);
        const account = await getAccount('lpk');
        if (process.env.NODE_ENV !== 'production') console.debug('[AkunLpkPage] account fetched', account);
        if (!active) return;
        setUserId(account.id);

        // Coba ambil dari cache localStorage (optimisasi visual) namun prioritaskan field langsung jika tersedia
        let cached: string | null = null;
        if (typeof window !== 'undefined') {
          try { cached = localStorage.getItem('lpk_username') || null; } catch {}
        }

        // Backend sekarang sudah mengirim 'username' langsung dalam payload /user/lpk/{id}
        let username = (account as any).username || cached || '';
        let extractionPathInitial: string | undefined = username ? 'account.username' : undefined;

        // Kumpulkan kandidat ID untuk detail LPK jika username belum ditemukan
        const candidateIds: (string | number)[] = Array.from(new Set([
          account.id,
          (account as any).lpk_id,
          (account as any).lembaga_pelatihan_id,
          (account as any).lembagaPelatihanId,
          (account?.lpk && account.lpk.id),
          (account?.data && account.data.lpk_id),
        ].filter(Boolean)));

        if (!username && candidateIds.length) {
          const detailPromises = candidateIds.map(cid => getLpkById(String(cid)).catch(() => null));
          for (let i=0;i<detailPromises.length;i++) {
            const detail = await detailPromises[i];
            if (detail) {
              const detExtract = extractUsernameFromAny(detail, 6, true, { allowEmailHeuristic: false }) as any;
              if (detExtract?.username) {
                username = detExtract.username;
                if (process.env.NODE_ENV !== 'production') {
                  console.debug('[AkunLpkPage] Username ditemukan dari detail LPK id=', candidateIds[i], 'path=', detExtract.path);
                }
                break;
              }
            }
          }
        }

        // (Dinonaktifkan) Fallback publik dihapus karena endpoint /api/lpk/{id} mengembalikan 404 dalam environment ini.
        if (!username && process.env.NODE_ENV !== 'production' && !warnedMissingUsername) {
          const keys = Object.keys(account || {});
          console.warn('[AkunLpkPage] Username belum ditemukan. Initial extraction path=', extractionPathInitial, 'Top-level keys=', keys);
          warnedMissingUsername = true;
        }

    const finalFallback = extractUsernameFromAny(account, 2, false, { allowEmailHeuristic: false });
    const finalUsername = (username && username.trim()) || (typeof finalFallback === 'string' ? finalFallback : (finalFallback as any)?.username) || 'Belum diatur';
        if (typeof window !== 'undefined' && finalUsername && finalUsername !== 'Belum diatur') {
          try { localStorage.setItem('lpk_username', finalUsername); } catch {}
        }
        setForm(prev => ({ ...prev, username: finalUsername, email: account.email || '-' }));
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Gagal memuat akun');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {!mounted ? (
        <div className="bg-white p-6 rounded-lg ">
          <AkunHeader />
          <p className="text-sm text-gray-500">Menyiapkan...</p>
        </div>
      ) : activeTab === "akun" && (
        <div className="bg-white p-6 rounded-lg">
          <AkunHeader />

          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner
                size={44}
                label="Memuat data akun..."
                labelPosition="below"
                styleType="dashed"
              />
            </div>
          )}

          {!loading && error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && !isEditing && (
            <AkunView
              form={form}
              setForm={setForm}
              onChangePassword={() => setIsEditing(true)}
              onShowToast={showToast}
              userId={userId}
              role="lpk"
            />
          )}

          {!loading && !error && isEditing && (
            <ChangePasswordFlow onCancel={() => setIsEditing(false)} />
          )}
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow text-white text-sm transition-opacity ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.msg}
        </div>
      )}
    </>
  );
}