"use client";

import { useState } from "react";
import { PiLockKey } from "react-icons/pi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface ChangePasswordStep1Props {
  oldPassword: string;
  setOldPassword: (value: string) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function ChangePasswordStep1({
  oldPassword,
  setOldPassword,
  onNext,
  onCancel,
}: ChangePasswordStep1Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <p className="mb-2">
        Silakan masukkan kata sandi kamu saat ini untuk menjaga keamanan akun !
      </p>

      <div className="relative w-full">
        <PiLockKey className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Kata Sandi Lama"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="border rounded px-10 py-2 w-full text-xs placeholder-gray-400"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black shadow-none border-none"
          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>

      {/* Link lupa password */}
      <div className="text-left">
        <a
          href="/lupa-kataSandi"
          className="text-[#0F67B1] text-xs underline hover:opacity-80"
        >
          Lupa kata sandi?
        </a>
      </div>

      <div className="flex mt-4 justify-center gap-3">
        <button
          type="button"
          className="bg-[#0F67B1] text-white px-4 py-2 rounded"
          onClick={onNext}
        >
          Lanjutkan
        </button>
        {/* Opsional tombol batal jika ingin ditampilkan */}
        {/* <button
          type="button"
          className="border px-4 py-2 rounded text-[#0F67B1] border-[#0F67B1]"
          onClick={onCancel}
        >
          Batal
        </button> */}
      </div>
    </>
  );
}
