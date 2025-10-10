"use client";
import { useState } from "react";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { updateAccount } from "@/services/account";

interface EditUsernameModalProps {
  isOpen: boolean;
  currentUsername: string;
  onClose: () => void;
  onSave: (newUsername: string) => void;
}

export default function EditUsernameModal({
  isOpen,
  currentUsername,
  onClose,
  onSave,
}: EditUsernameModalProps) {
  const [username, setUsername] = useState(currentUsername);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
        <div className="bg-white rounded-[50px] shadow-lg p-6 w-[535px] h-[233px] border-[5px] border-[#0F67B1] flex flex-col justify-center">
          <p className="font-semibold mb-4">Ubah Username Anda</p>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border mb-4 focus:outline-none focus:ring-1 focus:ring-[#0F67B1] rounded-[5px] px-3 py-2 text-sm"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md"
              disabled={saving}
            >
              Batal
            </button>
            <button
              onClick={async () => {
                if (!username || username.trim().length === 0) return;
                try {
                  setSaving(true);
                  // Determine role and id from localStorage (assume siswa)
                  const role = (localStorage.getItem('role') || 'siswa').toLowerCase();
                  let id: number | null = null;
                  try { const raw = localStorage.getItem('user'); if (raw) { const u = JSON.parse(raw); id = Number(u.id || u.user_id || u.siswa_id || u.sekolah_id || u.perusahaan_id || u.lpk_id) || null; } } catch {}
                  if (!id) throw new Error('ID akun tidak ditemukan (login ulang mungkin diperlukan)');
                  await updateAccount(role as any, id, { username: username.trim() });
                  // update parent state & localStorage
                  onSave(username.trim());
                  try { const raw = localStorage.getItem('user'); const existing = raw ? JSON.parse(raw) : {}; localStorage.setItem('user', JSON.stringify({ ...existing, username: username.trim() })); } catch {}
                  setShowSuccess(true);
                } catch (err: any) {
                  alert(err?.message || 'Gagal memperbarui username');
                } finally {
                  setSaving(false);
                }
              }}
              className="bg-[#0F67B1] text-white hover:opacity-80 px-4 py-2 rounded-md"
              disabled={saving}
            >
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
