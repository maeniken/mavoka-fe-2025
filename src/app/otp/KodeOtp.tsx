"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/app/components/registrasi/button";
import { verifyOtp, resendOtp } from "@/lib/api-otp";

export default function KodeOtp() {
  const [timeLeft, setTimeLeft] = useState(600);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const roleParam = searchParams.get("role");

    if (emailParam && roleParam) {
      setEmail(emailParam);
      setRole(roleParam);
    } else {
      alert("Email atau role tidak ditemukan");
      router.push("/registrasi");
    }
  }, [searchParams, router]);

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
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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

    try {
      const response = await verifyOtp({ email, role, otp: code });
      console.log("Verifikasi berhasil", response);
      router.replace("/login");
    } catch (err) {
      console.error("Verifikasi gagal", err);
      alert("Kode OTP salah atau expired");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto mt-10 p-4"
    >
      <h2 className="text-xl font-bold text-center text-black">
        Masukkan Kode OTP
      </h2>
      <p className="text-sm text-center text-gray-600">
        Kami telah mengirimkan kode ke email kamu. Silakan masukkan kode
        verifikasi di bawah.
      </p>

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
            }}
            className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F67B1]"
          />
        ))}
      </div>

      <p className="text-sm text-right text-gray-600">
        Waktu tersisa:{" "}
        <span className="font-semibold">{formatTime(timeLeft)}</span>
      </p>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Memproses..." : "Verifikasi"}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Tidak menerima kode?{" "}
        <button
          type="button"
          className="text-[#0F67B1] font-semibold hover:underline"
          onClick={async () => {
            if (!email || !role) {
              setToast({ message: "Email atau role tidak ditemukan", type: "error" });
              return;
            }
            setLoading(true);
            try {
              const resp = await resendOtp({ email, role });
              const msg = resp?.message || (resp?.email_status ? `Status: ${resp.email_status}` : "OTP dikirim");
              setToast({ message: msg, type: "success" });
            } catch (err) {
              console.error("Resend OTP failed", err);
              setToast({ message: "Gagal mengirim ulang OTP. Cek console atau coba lagi nanti.", type: "error" });
            } finally {
              setLoading(false);
              // auto-hide
              setTimeout(() => setToast(null), 3000);
            }
          }}
        >
          Kirim Ulang
        </button>
      </p>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded shadow-md text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </form>
  );
}
