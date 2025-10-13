//"use client";
//import { useState } from "react";
//import { HiOutlinePencilAlt } from "react-icons/hi";
//import { IoIosArrowForward } from "react-icons/io";
//import { FaEye, FaEyeSlash } from 'react-icons/fa'
//import EditUsernameModal from "./EditUsernameModal";

//interface AkunViewProps {
//  form: any;
//  setForm: (data: any) => void;
//  onChangePassword: () => void;
//  onShowToast?: (message: string, type: 'success' | 'error') => void;
//  userId?: number | null;
//  role?: 'lpk' | 'perusahaan' | 'siswa' | 'sekolah' | 'admin';
//}

//export default function AkunView({ form, setForm, onChangePassword, onShowToast, userId, role = 'lpk' }: AkunViewProps) {
//  const [isModalOpen, setIsModalOpen] = useState(false);
//  const [showPassword, setShowPassword] = useState(false);

//  const fields = [
//    {
//      label: "Username", // Field username untuk login, bukan nama perusahaan
//      value: (form.username === 'Belum diatur' || !form.username) ? 'Belum diatur' : form.username,
//      icon: (
//        <HiOutlinePencilAlt
//          className="text-[#0F67B1] cursor-pointer"
//          size={20}
//          onClick={() => setIsModalOpen(true)}
//        />
//      ),
//    },
//    {
//      label: "Kata Sandi",
//      value: showPassword ? form.password : "••••••••",
//      icon: (
//        <div className="flex items-center gap-2">
//          {showPassword ? (
//            <FaEye
//              size={20}
//              className="text-gray-600 cursor-pointer"
//              onClick={() => setShowPassword(false)}
//            />
//          ) : (
//            <FaEyeSlash
//              size={20}
//              className="text-gray-600 cursor-pointer"
//              onClick={() => setShowPassword(true)}
//            />
//          )}
//          <IoIosArrowForward
//            className="text-[#0F67B1] cursor-pointer"
//            size={20}
//            onClick={onChangePassword}
//          />
//        </div>
//      ),
//    },
//  ];

//  return (
//    <>
//      <div className="grid grid-cols-1 gap-4">
//        {fields.map((field) => (
//          <div key={field.label} className="flex flex-col">
//            <p className="font-medium text-black">{field.label}</p>
//            <div className="mt-1 border rounded-md px-3 py-2 bg-gray-50 flex items-center justify-between">
//              <p className="text-gray-500">{field.value || "-"}</p>
//              {field.icon}
//            </div>
//          </div>
//        ))}
//      </div>

//      <EditUsernameModal
//        isOpen={isModalOpen}
//        currentUsername={form.username}
//        onClose={() => setIsModalOpen(false)}
//        onSave={(newUsername) => {
//          setForm({ ...form, username: newUsername });
//          if (onShowToast) {
//            onShowToast('Username berhasil diperbarui', 'success');
//          }
//        }}
//        onShowToast={onShowToast}
//        userId={userId}
//        role={role}
//      />
//    </>
//  );
//}

"use client";
import { useMemo, useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { updateAccount, getAccount } from "@/services/account";

interface AkunViewProps {
  form: any;
  setForm: (data: any) => void;
  onChangePassword: () => void;
  onShowToast?: (message: string, type: "success" | "error") => void;
  userId?: number | null;
  role?: "lpk" | "perusahaan" | "siswa" | "sekolah" | "admin";
}

export default function AkunView({
  form,
  setForm,
  onChangePassword,
  onShowToast,
  userId,
  role = "lpk",
}: AkunViewProps) {
  // password selalu disembunyikan (tanpa toggle)
  const maskedPassword = "••••••••";

  // inline editing state (username)
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(form.username || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // fallback role & id dari localStorage bila props kosong
  const { effectiveRole, effectiveId } = useMemo(() => {
    let r =
      role ??
      (typeof window !== "undefined" ? (localStorage.getItem("role") || "lpk") : "lpk");
    let id = userId ?? null;
    if (!id && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          id =
            Number(
              u.id || u.user_id || u.siswa_id || u.sekolah_id || u.perusahaan_id || u.lpk_id
            ) || null;
        }
      } catch {}
    }
    return { effectiveRole: r as AkunViewProps["role"], effectiveId: id };
  }, [role, userId]);

  async function handleSave() {
    const value = (draft || "").trim();
    if (!value) {
      onShowToast?.("Username tidak boleh kosong", "error");
      return;
    }
    if (!effectiveId) {
      onShowToast?.("User ID tidak tersedia", "error");
      return;
    }

    try {
      setSaving(true);
      const result = await updateAccount(effectiveRole as any, effectiveId, { username: value });
      const returnedUsername = (result?.username || result?.data?.username || "").trim();
      if (returnedUsername && returnedUsername.toLowerCase() !== value.toLowerCase()) {
        onShowToast?.(
          "Backend tidak mengembalikan username yang sama (cek validasi/uniqueness).",
          "error"
        );
        setSaving(false);
        return;
      }

      // optional verifikasi
      try {
        const fresh = await getAccount(effectiveRole as any, effectiveId);
        const freshU = (fresh?.username || "").trim();
        if (freshU && freshU.toLowerCase() !== value.toLowerCase()) {
          onShowToast?.(
            "Perhatian: Server belum memantulkan username baru. Coba reload / cek validasi backend.",
            "error"
          );
          setSaving(false);
          return;
        }
      } catch (e) {
        console.warn("[AkunView] Refetch username gagal", e);
      }

      // sinkron state & cache
      setForm({ ...form, username: value });
      try {
        const cacheKey = `${effectiveRole}_username`;
        localStorage.setItem(cacheKey, value);
        if (effectiveRole === "lpk") localStorage.setItem("lpk_username", value);
        const raw = localStorage.getItem("user");
        const existing = raw ? JSON.parse(raw) : {};
        localStorage.setItem("user", JSON.stringify({ ...existing, username: value }));
      } catch (e) {
        console.warn("[AkunView] gagal update localStorage", e);
      }

      setSuccess(true);
      setEditing(false);
      onShowToast?.("Username berhasil diperbarui", "success");
    } catch (err: any) {
      onShowToast?.(err?.message || "Gagal memperbarui username", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {/* USERNAME */}
        <div className="flex flex-col">
          <p className="font-medium text-black">Username</p>

          {!editing ? (
            // TAMPILAN BACA: klik seluruh field untuk masuk mode edit
            <button
              type="button"
              onClick={() => {
                setDraft(form.username || "");
                setEditing(true);
              }}
              className="mt-1 w-full text-left bg-white border border-[#0F67B1] rounded-md px-3 py-2"
            >
              <span className="text-gray-700">{form.username || "Belum diatur"}</span>
            </button>
          ) : (
            // MODE EDIT: langsung border-2 #0F67B1 (tanpa perlu klik lagi)
            <div className="mt-1 flex flex-col gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Masukkan username baru"
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
                className="w-full text-sm rounded-md px-3 py-2 border-2 border-[#0F67B1] focus:!border-2 focus:!border-[#0F67B1] focus:!ring-0 focus:!outline-none"
                disabled={saving}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-white text-[#0F67B1] border border-[#0F67B1]"
                  onClick={() => {
                    setEditing(false);
                    setDraft(form.username || "");
                  }}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-[#0F67B1] text-white disabled:opacity-60 flex items-center gap-2"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving && <LoadingSpinner size={16} variant="primary" />}
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KATA SANDI */}
        <div className="flex flex-col">
          <p className="font-medium text-black">Kata Sandi</p>
          <div className="mt-1 border border-[#0F67B1] rounded-md px-3 py-2 bg-white flex items-center justify-between">
            <p className="text-gray-700">{maskedPassword}</p>
            <button
              type="button"
              onClick={onChangePassword}
              className="text-[#0F67B1] hover:opacity-80 shadow-none px-0 py-0"
              title="Ganti kata sandi"
              aria-label="Ganti kata sandi"
            >
              <IoIosArrowForward size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Success modal setelah username berhasil diubah */}
      <SuccessModal
        open={success}
        title="Berhasil"
        message="Username Anda berhasil diperbaharui!"
        onClose={() => setSuccess(false)}
      />
    </>
  );
}
