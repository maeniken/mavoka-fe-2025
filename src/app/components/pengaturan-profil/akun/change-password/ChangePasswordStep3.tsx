"use client";
import { useRef, useState, useEffect } from "react";

interface ChangePasswordStep3Props {
  otp: string;
  setOtp: (value: string) => void;
  onFinish: () => Promise<void> | void;
  loading?: boolean;
  emailTo?: string | null;
  onBack: () => void;
}

export default function ChangePasswordStep3({
  otp,
  setOtp,
  onFinish,
  loading = false,
  emailTo = null,
}: ChangePasswordStep3Props) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 600 detik = 10 menit
  const [resendLoading, setResendLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Hitung mundur waktu
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format ke mm:ss
  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (value: string, index: number) => {
    const otpArray = otp.split("");
    otpArray[index] = value.slice(-1);
    const newOtp = otpArray.join("");
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    // basic guard
    if (!emailTo) {
      setInfoMessage('Email tidak tersedia untuk pengiriman ulang OTP');
      return;
    }

    // determine API root + role + token similar to the flow component
    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
    const apiRoot = `${API_BASE.replace(/\/+$/g, '')}/api`;

    const stored = localStorage.getItem('user');
    let parsed: any = null;
    if (stored) {
      try { parsed = JSON.parse(stored); } catch(e) { /* ignore */ }
    }
    const tokenCandidates = [localStorage.getItem('token'), localStorage.getItem('access_token'), localStorage.getItem('access_token_sekolah'), parsed?.token, parsed?.access_token];
    const token = tokenCandidates.find((t:any) => typeof t === 'string' && t?.length > 0) || null;
    const role = parsed?.role ?? 'sekolah';

    setResendLoading(true);
    setInfoMessage(null);
    try {
      const url = `${apiRoot}/user/resend-otp/${role}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email: emailTo }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInfoMessage(body?.message ?? `Gagal mengirim ulang OTP (${res.status})`);
        return;
      }

      // success: reset timer and show info
      setTimeLeft(600);
      setOtp('');
      setInfoMessage(body?.message ?? 'OTP berhasil dikirim ulang');
    } catch (err: any) {
      setInfoMessage('Gagal mengirim ulang OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="font-bold mb-1">Masukan Kode</h2>
      <p className="text-black mb-4">
        Kami telah mengirimkan kode ke{" "}
        <span className="font-semibold">
          {emailTo ?? "email tidak tersedia"}
        </span>
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ""}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-12 h-12 text-center border rounded text-lg font-semibold focus:border-[#0F67B1] focus:outline-none"
          />
        ))}
      </div>

      <p className="text-sm mb-6 flex justify-between items-center">
        <span className="text-black">
          Belum mendapatkan kode?{" "}
          <span className="text-[#0F67B1] font-semibold ml-1 cursor-pointer hover:underline">
            Kirim ulang
          </span>
        </span>
        <span className="text-[#0F67B1] font-semibold">
          Waktu tersisa: {formatTime(timeLeft)}
        </span>
      </p>

      <button
        onClick={onFinish}
        className="bg-[#0F67B1] text-white px-6 py-2 rounded disabled:opacity-60"
        disabled={timeLeft <= 0 || loading}
      >
        {loading ? "Memproses..." : "Lanjutkan"}
      </button>
    </div>
  );
}
