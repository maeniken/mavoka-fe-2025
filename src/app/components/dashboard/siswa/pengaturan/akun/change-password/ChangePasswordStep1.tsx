"use client";

import { useState } from "react";
import { verifyPassword } from "@/services/account";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className=" w-full text-left">
        <a
          href="/lupa-kataSandi"
          className="text-[#0F67B1] text-xs underline hover:opacity-80"
        >
          Lupa kata sandi?
        </a>
      </div>

      <div className="flex mt-4 justify-center flex-col items-center gap-2">
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex gap-2">
          <button
            className="bg-[#0F67B1] text-white px-4 py-2 rounded disabled:opacity-60"
            onClick={async () => {
              setError(null);
              if (!oldPassword || oldPassword.trim().length === 0) {
                setError("Masukkan kata sandi lama");
                return;
              }
              setLoading(true);
              try {
                const role = (localStorage.getItem("role") || "siswa").toLowerCase() as any;
                await verifyPassword(role, oldPassword);
                onNext();
              } catch (err: any) {
                setError(err?.message || "Kata sandi tidak cocok");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Memeriksa..." : "Lanjutkan"}
          </button>

          {/*<button className="border px-4 py-2 rounded" onClick={onCancel} disabled={loading}>
            Batal
          </button>*/}
        </div>
      </div>
    </>
  );
}
