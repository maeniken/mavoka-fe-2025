"use client";
import { useState, useRef } from "react";
import ChangePasswordStep1 from "./change-password/ChangePasswordStep1";
import ChangePasswordStep2 from "./change-password/ChangePasswordStep2";
import ChangePasswordStep3 from "./change-password/ChangePasswordStep3";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";

interface ChangePasswordFlowProps {
  onCancel: () => void;
  /**
   * (Optional) Paksa role yang digunakan untuk endpoint backend.
   * Jika tidak diberikan, akan dicoba infer dari object user di localStorage.
   */
  role?: 'siswa' | 'sekolah' | 'perusahaan' | 'lpk';
}

export default function ChangePasswordFlow({
  onCancel,
  role: roleProp,
}: ChangePasswordFlowProps) {
  const [step, setStep] = useState(1);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success'|'error'; message: string } | null>(null);
  const notifTimerRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const showNotification = (type: 'success'|'error', message: string, ttl = 4000) => {
    setNotification({ type, message });
    try { if (notifTimerRef.current) window.clearTimeout(notifTimerRef.current); } catch(e){}
  notifTimerRef.current = window.setTimeout(() => setNotification(null), ttl) as unknown as number;
  };

  // Helper: baca user + token + role dari localStorage sekali agar konsisten
  const getAuthContext = () => {
    const stored = localStorage.getItem('user');
    let parsed: any = null;
    if (stored) {
      try { parsed = JSON.parse(stored); } catch { /* ignore */ }
    }
    // Jika role dipaksa via prop gunakan itu.
    // Jika tidak ada, infer berdasarkan field-field khas supaya tidak default salah ke 'sekolah'.
    const inferRole = (p: any): 'siswa' | 'sekolah' | 'perusahaan' | 'lpk' => {
      if (!p) return 'sekolah';
      if (p.role && ['siswa','sekolah','perusahaan','lpk'].includes(p.role)) return p.role;
      if (p.nama_perusahaan || p.logo_perusahaan) return 'perusahaan';
      if (p.nama_sekolah || p.npsn || p.logo_sekolah) return 'sekolah';
      if (p.nama_lembaga || p.logo_lembaga || p.status_akreditasi) return 'lpk';
      if (p.nisn || p.jurusan) return 'siswa';
      return 'sekolah';
    };
    const role: 'siswa' | 'sekolah' | 'perusahaan' | 'lpk' = roleProp || inferRole(parsed);
    const tokenCandidates = [
      localStorage.getItem('token'),
      localStorage.getItem('access_token'),
      localStorage.getItem('access_token_sekolah'),
      parsed?.token,
      parsed?.access_token,
      parsed?.accessToken,
    ];
    const token = tokenCandidates.find(t => typeof t === 'string' && t.length > 0) || null;
    // Email kemungkinan berada di beragam struktur
    const email = parsed?.email || parsed?.user?.email || parsed?.email_sekolah || parsed?.email_perusahaan || parsed?.email_lpk || null;
    return { parsed, role, token, email };
  };

  // Verify current password with backend before proceeding to step 2
  const handleVerifyCurrentPassword = async () => {
    if (!oldPassword || oldPassword.trim() === '') {
      showNotification('error', 'Kata sandi lama diperlukan');
      return;
    }

    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
    const apiRoot = `${API_BASE.replace(/\/+$|\/$/g, '')}/api`;
    const { role, token } = getAuthContext();
    try {
      const url = `${apiRoot}/user/verify-password/${role}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ current_password: oldPassword }),
      });

      if (!res.ok) {
        // If backend indicates wrong password, show a friendly message
        if (res.status === 400) {
          showNotification('error', 'Password tidak cocok');
          return;
        }
        const txt = await res.json().catch(() => null);
        const msg = txt?.message ?? `${res.status} ${res.statusText}`;
        showNotification('error', msg);
        return;
      }

      // success -> go to step 2
      setStep(2);
    } catch (err: any) {
      console.error('verify password error', err);
      showNotification('error', err?.message ? String(err.message) : 'Gagal memverifikasi kata sandi');
    }
  };

  // Step2: validate new password and request OTP to user's email
  const handleRequestOtp = async () => {
    if (!newPassword || newPassword.length < 6) {
      showNotification('error', 'Kata sandi baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Kata sandi baru tidak cocok');
      return;
    }

    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
    const apiRoot = `${API_BASE.replace(/\/+$|\/$/g, '')}/api`;
    const { role, token, email } = getAuthContext();
  // store email for Step3 display
  setUserEmail(email);
    if (!email) {
      showNotification('error', 'Email pengguna tidak ditemukan.');
      return;
    }

    setLoading(true);
    try {
      const url = `${apiRoot}/user/forgot-password/${role}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const txt = await res.json().catch(() => null);
        const msg = txt?.message ?? `${res.status} ${res.statusText}`;
        showNotification('error', msg);
        return;
      }

      showNotification('success', 'OTP telah dikirim ke email Anda');
      setStep(3);
    } catch (err: any) {
      console.error('request otp error', err);
      showNotification('error', 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step3: submit otp + new password to reset endpoint
  const handleResetPassword = async () => {
    if (!otp || otp.trim().length === 0) {
      showNotification('error', 'Kode OTP diperlukan');
      return;
    }

    const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
    const apiRoot = `${API_BASE.replace(/\/+$|\/$/g, '')}/api`;
    const { role, token, email } = getAuthContext();
    if (!email) {
      showNotification('error', 'Email pengguna tidak ditemukan.');
      return;
    }

    setLoading(true);
    try {
      const url = `${apiRoot}/user/reset-password/${role}`;
      const payload = {
        email,
        otp,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      } as any;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.json().catch(() => null);
        const msg = txt?.message ?? `${res.status} ${res.statusText}`;
        showNotification('error', msg);
        return;
      }

      showNotification('success', 'Kata sandi berhasil diubah');
      setShowSuccess(true);
    } catch (err: any) {
      console.error('reset password error', err);
      showNotification('error', 'Gagal mereset kata sandi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {notification && (
          <div className={`p-3 rounded ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {notification.message}
          </div>
        )}
        {step === 1 && (
          <ChangePasswordStep1
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            onNext={handleVerifyCurrentPassword}
            onCancel={onCancel}
          />
        )}

        {step === 2 && (
          <ChangePasswordStep2
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            onNext={handleRequestOtp}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}

        {step === 3 && (
          <ChangePasswordStep3
            otp={otp}
            setOtp={setOtp}
            onFinish={handleResetPassword}
            onBack={() => setStep(2)}
            loading={loading}
            emailTo={userEmail}
          />
        )}
      </div>

      <SuccessModal
        open={showSuccess}
        title="Berhasil"
        message="Kata sandi Anda berhasil diperbaharui!"
        onClose={() => {
          onCancel();
        }}
      />
    </>
  );
}
