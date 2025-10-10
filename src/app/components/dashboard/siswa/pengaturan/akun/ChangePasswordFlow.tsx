"use client";
import { useState, useEffect } from "react";
import ChangePasswordStep1 from "./change-password/ChangePasswordStep1";
import ChangePasswordStep2 from "./change-password/ChangePasswordStep2";
import ChangePasswordStep3 from "./change-password/ChangePasswordStep3";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { resendOtp, verifyOtp } from "@/lib/api-otp";
import { updateAccount } from "@/services/account";

interface ChangePasswordFlowProps {
  onCancel: () => void;
}

export default function ChangePasswordFlow({
  onCancel,
}: ChangePasswordFlowProps) {
  const [step, setStep] = useState(1);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // helper to get role/id/email from localStorage
  function readLocalAccount() {
    try {
      const role = (localStorage.getItem('role') || 'siswa').toLowerCase();
      const raw = localStorage.getItem('user');
      const user = raw ? JSON.parse(raw) : {};
      const id = Number(user.id || user.user_id || user.siswa_id || user.sekolah_id || user.perusahaan_id || user.lpk_id) || null;
      const email = user.email || '';
      return { role, id, email } as { role: string; id: number | null; email: string };
    } catch { return { role: 'siswa', id: null, email: '' }; }
  }

  // when entering step 3, send OTP to user's email
  useEffect(() => {
    if (step !== 3) return;
    const { role, email } = readLocalAccount();
    if (!email) {
      alert('Email user tidak ditemukan. Silakan perbarui profil Anda.');
      return;
    }
    (async () => {
      try {
        const resp = await resendOtp({ email, role });
        const msg = resp?.message || (resp?.email_status ? `Status: ${resp.email_status}` : 'OTP dikirim');
        // show simple alert for now
        alert(msg);
      } catch (err) {
        console.error('resendOtp failed', err);
        alert('Gagal mengirim OTP. Cek konsol atau coba lagi nanti.');
      }
    })();
  }, [step]);

  return (
    <>
      <div className="space-y-4">
        {step === 1 && (
          <ChangePasswordStep1
            oldPassword={oldPassword}
            setOldPassword={setOldPassword}
            onNext={() => setStep(2)}
            onCancel={onCancel}
          />
        )}

        {step === 2 && (
          <ChangePasswordStep2
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <ChangePasswordStep3
            otp={otp}
            setOtp={setOtp}
            onFinish={async () => {
              // verify otp and update password
              const { role, id, email } = readLocalAccount();
              if (!id) {
                alert('ID user tidak ditemukan.');
                return;
              }
              const code = otp;
              if (!code || code.length < 6) {
                alert('Masukkan 6 digit kode OTP');
                return;
              }
              try {
                await verifyOtp({ email, role, otp: code });
              } catch (err: any) {
                console.error('verifyOtp failed', err);
                alert('Kode OTP salah atau expired');
                return;
              }

              try {
                await updateAccount(role as any, id, { password: newPassword });
                setShowSuccess(true);
              } catch (err: any) {
                console.error('updateAccount failed', err);
                alert(err?.message || 'Gagal memperbarui password');
              }
            }}
            onBack={() => setStep(2)}
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
