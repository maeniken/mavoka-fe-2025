"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/registrasi/input";
import Button from "@/app/components/registrasi/button";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { sendForgotOtp } from "@/lib/api-forgot";

export default function FormLupaSandi() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      // Default role diasumsikan siswa kecuali nanti ada selector role.
      await sendForgotOtp({ email, role: "siswa" });
      // Simpan email di session agar tidak perlu taruh di URL saat ke halaman OTP
      if (typeof window !== 'undefined') {
        try { sessionStorage.setItem('fp_email', email); } catch {}
      }
      setOpen(true); // tampilkan popup sukses
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Gagal mengirim OTP";
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Pastikan email tersimpan untuk halaman OTP
    if (typeof window !== 'undefined') {
      try { sessionStorage.setItem('fp_email', email); } catch {}
    }
    router.push(`/lupa-kataSandi/otp-lupaSandi`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-center text-black">
          Lupa Kata sandi
        </h2>
        <p className="text-sm text-center text-gray-400">
          Masukan email Anda untuk memverifikasi proses
        </p>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div>
          <label className="block text-sm text-black mb-1">Email</label>
          <Input
            type="email"
            placeholder="emailanda@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full rounded-full flex items-center justify-center gap-2"
          disabled={sending}
          aria-busy={sending}
        >
          {sending && (
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden
            />
          )}
          {sending ? "Mengirim..." : "Kirim"}
        </Button>
      </form>
      <SuccessModal
        open={open}
        title="Berhasil"
        message={
          <>
            Selamat kode sudah dikirim ke email Anda.
            <br />
            Silakan periksa email Anda.
          </>
        }
        onClose={handleClose}
      />
    </>
  );
}
