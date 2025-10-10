"use client";
import { useState } from "react";
import { PiLockKey } from "react-icons/pi";
import { FaEye, FaEyeSlash } from 'react-icons/fa'

interface ChangePasswordStep2Props {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  onNext: () => Promise<void> | void;
  loading?: boolean;
  onBack: () => void;
}

export default function ChangePasswordStep2({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  onNext,
  loading = false,
  onBack,
}: ChangePasswordStep2Props) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full">
      <p className="font-semibold mb-2">Masukkan Kata Sandi Baru</p>

      <div className="relative mb-2">
        <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="Kata Sandi Baru"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="border rounded px-10 py-2 w-full text-xs placeholder-gray-400"
        />
        <button
          type="button"
          onClick={() => setShowNewPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black shadow-none rounded-none"
        >
          {showNewPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>

      <div className="relative">
        <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Konfirmasi Kata Sandi Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border rounded px-10 py-2 w-full text-xs placeholder-gray-400"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black shadow-none rounded-none"
        >
          {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>

      <div className="flex mt-4 justify-center">
        <button
          className="bg-[#0F67B1] text-white px-4 py-2 rounded disabled:opacity-60"
          onClick={onNext}
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Lanjutkan'}
        </button>
      </div>
    </div>
  );
}
