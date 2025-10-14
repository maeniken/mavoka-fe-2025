"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/app/components/registrasi/button";
import { resendOtp } from "@/lib/api-otp";

export default function FormOtpLupa() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ambil email dari sessionStorage (utama) atau URL (fallback)
  useEffect(() => {
    const emailStore = typeof window !== 'undefined' ? sessionStorage.getItem('fp_email') : null;
    const emailParam = searchParams.get("email");
    const picked = emailStore || emailParam;
    if (picked) {
      setEmail(picked);
    } else {
      alert("Email tidak ditemukan");
      router.push("/lupa-kataSandi");
    }
  }, [searchParams, router]);

  // Timer OTP
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Input OTP
  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      alert("Masukkan 6 digit kode OTP");
      return;
    }  
    setError(null);
    setLoading(true);
    // Simpan sementara di sessionStorage agar tidak muncul di URL
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('fp_email', email);
        sessionStorage.setItem('fp_otp', code);
      } catch { /* ignore quota errors */ }
    }
    // Lanjut ke halaman reset tanpa query sensitif
    router.push(`/lupa-kataSandi/reset-Sandi`);
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendOtp({ email, role: "siswa" });
      alert("Kode dikirim ulang");
      setTimeLeft(600);
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Gagal mengirim ulang OTP");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto mt-6 p-4">
      <h2 className="text-xl font-bold text-center text-black">Masukkan Kode OTP</h2>
      <p className="text-sm text-center text-gray-600">
        Kami telah mengirimkan kode ke email kamu. Silakan masukkan kode verifikasi di bawah.
      </p>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <div className="flex justify-between gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={(el) => {
              inputRefs.current[index] = el;
              return undefined;
            }}
            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F67B1]"
          />
        ))}
      </div>

      <p className="text-sm text-right text-gray-600">
        Waktu tersisa:{" "}
        <span className="font-semibold">{formatTime(timeLeft)}</span>
      </p>

      <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading} aria-busy={loading}>
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
        )}
        {loading ? "Memproses..." : "Kirim"}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Tidak menerima kode?{" "}
        <button
          type="button"
          className="text-[#0F67B1] font-semibold hover:underline bg-none border-none p-0 shadow-none"
          onClick={handleResend}
        >
          Kirim Ulang
        </button>
      </p>
    </form>
  );
}
