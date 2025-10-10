"use client";
import { useState, useEffect } from "react";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { updateAccount, getAccount } from "@/services/account";

interface EditUsernameModalProps {
  isOpen: boolean;
  currentUsername: string;
  onClose: () => void;
  onSave: (newUsername: string) => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  userId?: number | null;
  role?: 'lpk' | 'perusahaan' | 'siswa' | 'sekolah' | 'admin';
}

export default function EditUsernameModal({
  isOpen,
  currentUsername,
  onClose,
  onSave,
  onShowToast,
  userId,
  role = 'lpk',
}: EditUsernameModalProps) {
  // Placeholder -> kosongkan input
  const normalized = (currentUsername === 'Belum diatur' || !currentUsername) ? '' : currentUsername;
  const [username, setUsername] = useState(normalized);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sinkronkan ketika modal dibuka ulang dengan nilai terbaru
  useEffect(() => {
    if (isOpen) {
      setUsername(normalized);
    }
  }, [isOpen, normalized]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
        <div className="bg-white rounded-[50px] shadow-lg p-6 w-[535px] h-[280px] border-[5px] border-[#0F67B1] flex flex-col justify-center">
          <p className="font-semibold mb-2">Atur Username Anda</p>
          <p className="text-sm text-gray-600 mb-2">Username digunakan untuk login, berbeda dengan nama perusahaan</p>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username baru"
            className="w-full border mb-4 focus:outline-none focus:ring-1 focus:ring-[#0F67B1] rounded-[5px] px-3 py-2 text-sm"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                const value = username.trim();
                if (!value) {
                  onShowToast?.('Username tidak boleh kosong', 'error');
                  return;
                }
                if (!userId) {
                  onShowToast?.('User ID tidak tersedia', 'error');
                  return;
                }
                try {
                  setSaving(true);
                  // Gunakan role dinamis (default lpk)
                  const result = await updateAccount(role, userId, { username: value });
                  if (process.env.NODE_ENV !== 'production') console.debug('[EditUsernameModal] Update result:', result);
                  const returnedUsername = (result?.username || result?.data?.username || '').trim();
                  if (returnedUsername && returnedUsername.toLowerCase() !== value.toLowerCase()) {
                    onShowToast?.('Backend tidak mengembalikan username yang sama (cek validasi / uniqueness).', 'error');
                    setSaving(false);
                    return;
                  }

                  // Refetch verifikasi (khususnya untuk role selain lpk yang sempat gagal)
                  try {
                    const fresh = await getAccount(role as any, userId);
                    const freshUser = (fresh?.username || '').trim();
                    if (process.env.NODE_ENV !== 'production') {
                      console.debug('[EditUsernameModal] Refetched account after update', { role, userId, freshUser });
                    }
                    if (freshUser && freshUser.toLowerCase() !== value.toLowerCase()) {
                      onShowToast?.('Perhatian: Server belum memantulkan username baru. Coba reload atau periksa validasi backend.', 'error');
                      // Jangan lanjut success modal supaya user aware
                      setSaving(false);
                      return;
                    }
                  } catch (verErr) {
                    console.warn('[EditUsernameModal] Gagal refetch verifikasi username', verErr);
                  }
                  try {
                    // Simpan ke cache username khusus role
                    const cacheKey = `${role}_username`;
                    localStorage.setItem(cacheKey, value);
                    // Backward compatibility untuk implementasi lama LPK
                    if (role === 'lpk') {
                      localStorage.setItem('lpk_username', value);
                    }
                    // Update user generic object jika dipakai tempat lain
                    const raw = localStorage.getItem('user');
                    const existing = raw ? JSON.parse(raw) : {};
                    const updatedUser = { ...existing, username: value };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    if (process.env.NODE_ENV !== 'production') console.debug('[EditUsernameModal] localStorage updated with new LPK username');
                  } catch (e) {
                    console.warn('[EditUsernameModal] Failed updating localStorage', e);
                  }
                  onSave(value);
                  setShowSuccess(true);
                } catch (err: any) {
                  onShowToast?.(err?.message || 'Gagal memperbarui username', 'error');
                } finally {
                  setSaving(false);
                }
              }}
              className="bg-[#0F67B1] text-white hover:opacity-80 px-4 py-2 rounded-md flex items-center gap-2"
              disabled={saving}
            >
              {saving && <LoadingSpinner size={16} variant="primary" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      <SuccessModal
        open={showSuccess}
        title="Berhasil"
        message="Username Anda berhasil diperbaharui!"
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
    </>
  );
}
