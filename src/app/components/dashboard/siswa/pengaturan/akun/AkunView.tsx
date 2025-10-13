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
//}

//export default function AkunView({ form, setForm, onChangePassword }: AkunViewProps) {
//  const [isModalOpen, setIsModalOpen] = useState(false);
//  const [showPassword, setShowPassword] = useState(false);

//  const fields = [
//    {
//      label: "Username",
//      value: form.username,
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
//        onSave={(newUsername) => setForm({ ...form, username: newUsername })}
//      />
//    </>
//  );
//}


"use client";
import { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoIosArrowForward } from "react-icons/io";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { updateAccount } from "@/services/account";

interface AkunViewProps {
  form: any;
  setForm: (data: any) => void;
  onChangePassword: () => void;
}

export default function AkunView({ form, setForm, onChangePassword }: AkunViewProps) {
  const [showPassword, setShowPassword] = useState(false);

  // inline edit state
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState<string>(form.username || "");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // tampilkan bullet jika tidak ada plaintext password
  const masked = "••••••••";
  const displayPassword =
    showPassword && typeof form?.password === "string" && form.password.length > 0
      ? form.password
      : masked;

  // === Save username ke endpoint (sama seperti EditUsernameModal) ===
  const handleSaveUsername = async () => {
    const next = (usernameDraft || "").trim();
    if (!next || next === form.username) {
      setEditingUsername(false);
      setUsernameDraft(form.username || "");
      return;
    }
    try {
      setSaving(true);
      // baca role & id dari localStorage (sesuai modal sebelumnya)
      const role = (localStorage.getItem("role") || "siswa").toLowerCase();
      let id: number | null = null;
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
      if (!id) throw new Error("ID akun tidak ditemukan (login ulang mungkin diperlukan)");

      await updateAccount(role as any, id, { username: next });

      // update state & localStorage agar konsisten
      setForm({ ...form, username: next });
      try {
        const raw = localStorage.getItem("user");
        const existing = raw ? JSON.parse(raw) : {};
        localStorage.setItem("user", JSON.stringify({ ...existing, username: next }));
      } catch {}

      setShowSuccess(true);   // tampilkan popup berhasil
      setEditingUsername(false);
    } catch (err: any) {
      alert(err?.message || "Gagal memperbarui username");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {/* Username */}
        <div className="flex flex-col">
          <p className="font-medium text-black">Username</p>

          {!editingUsername ? (
            <div className="mt-1 border rounded-md px-3 py-2 bg-gray-50 flex items-center justify-between">
              <p className="text-gray-700">{form.username || "Belum diatur"}</p>
              <button
                type="button"
                className="text-[#0F67B1] hover:opacity-80 shadow-none px-0 py-0"
                title="Ubah username"
                aria-label="Ubah username"
                onClick={() => {
                  setUsernameDraft(form.username || "");
                  setEditingUsername(true);
                }}
              >
                <HiOutlinePencilAlt size={20} />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              <input
                type="text"
                value={usernameDraft}
                onChange={(e) => setUsernameDraft(e.target.value)}
                placeholder="Masukkan username baru"
                className="w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:border-2 border-[#0F67B1] focus:border-[#0F67B1]"
                disabled={saving}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-white text-[#0F67B1] border border-[#0F67B1]"
                  onClick={() => {
                    setEditingUsername(false);
                    setUsernameDraft(form.username || "");
                  }}
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-[#0F67B1] text-white disabled:opacity-60"
                  onClick={handleSaveUsername}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kata Sandi */}
        <div className="flex flex-col">
          <p className="font-medium text-black">Kata Sandi</p>
          <div className="mt-1 border rounded-md px-3 py-2 bg-gray-50 flex items-center justify-between">
            <p className="text-gray-700">{displayPassword}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-black shadow-none px-0 py-0"
                title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
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
      </div>

      {/* Success popup setelah username berhasil diubah */}
      <SuccessModal
        open={showSuccess}
        title="Berhasil"
        message="Username Anda berhasil diperbaharui!"
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
