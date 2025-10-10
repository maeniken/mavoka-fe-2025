"use client";
import { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoIosArrowForward } from "react-icons/io";
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import EditUsernameModal from "./EditUsernameModal";

interface AkunViewProps {
  form: any;
  setForm: (data: any) => void;
  onChangePassword: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
  userId?: number | null;
  role?: 'lpk' | 'perusahaan' | 'siswa' | 'sekolah' | 'admin';
}

export default function AkunView({ form, setForm, onChangePassword, onShowToast, userId, role = 'lpk' }: AkunViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fields = [
    {
      label: "Username", // Field username untuk login, bukan nama perusahaan
      value: (form.username === 'Belum diatur' || !form.username) ? 'Belum diatur' : form.username,
      icon: (
        <HiOutlinePencilAlt
          className="text-[#0F67B1] cursor-pointer"
          size={20}
          onClick={() => setIsModalOpen(true)}
        />
      ),
    },
    {
      label: "Kata Sandi",
      value: showPassword ? form.password : "••••••••",
      icon: (
        <div className="flex items-center gap-2">
          {showPassword ? (
            <FaEye
              size={20}
              className="text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <FaEyeSlash
              size={20}
              className="text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          )}
          <IoIosArrowForward
            className="text-[#0F67B1] cursor-pointer"
            size={20}
            onClick={onChangePassword}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col">
            <p className="font-medium text-black">{field.label}</p>
            <div className="mt-1 border rounded-md px-3 py-2 bg-gray-50 flex items-center justify-between">
              <p className="text-gray-500">{field.value || "-"}</p>
              {field.icon}
            </div>
          </div>
        ))}
      </div>

      <EditUsernameModal
        isOpen={isModalOpen}
        currentUsername={form.username}
        onClose={() => setIsModalOpen(false)}
        onSave={(newUsername) => {
          setForm({ ...form, username: newUsername });
          if (onShowToast) {
            onShowToast('Username berhasil diperbarui', 'success');
          }
        }}
        onShowToast={onShowToast}
        userId={userId}
        role={role}
      />
    </>
  );
}
