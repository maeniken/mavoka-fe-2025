"use client";

import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import Input from "@/app/components/registrasi/input";
import ComboAsalSekolah from "@/app/components/registrasi/comboAsalSekolah";
import Button from "@/app/components/registrasi/button";
import InputPassword from "@/app/components/registrasi/InputPassword";
import SuccesModal from "@/app/components/registrasi/PopupBerhasil";
import { lengkapiRegistrasiSiswa } from "@/lib/api-auth";
import { RegisterSiswa } from "@/types/user";

type FormValues = {
  username: string;
  nama_sekolah: string;
  nisn: string;
  email: string;
  password: string;
};

export default function FormSMK() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState<{
    email: string;
    role: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nisnChecking, setNisnChecking] = useState(false);
  const nisnTimer = useRef<any>(null);
  const emailTouched = useRef(false);
  const sekolahTouched = useRef(false);

  const onSubmit = async (data: FormValues) => {
    // Sesuai alur: siswa melengkapi registrasi berdasarkan NISN yang sudah ada
    const payload = {
      nisn: data.nisn,
      username: data.username,
      password: data.password,
      password_confirmation: data.password, // antisipasi jika BE meminta konfirmasi
      nama_sekolah: data.nama_sekolah,
      email: data.email,
    };

    try {
      setLoading(true);
      const res = await lengkapiRegistrasiSiswa(payload);
      console.log("Respon lengkapi-registrasi:", res.data);
      const emailForOtp = res?.data?.email ?? data.email;
      setRedirectInfo({ email: emailForOtp, role: "siswa" });
      setShowSuccessPopup(true);
      reset();
      setErrorMsg(null);
    } catch (err: any) {
      // axios error shape: err.response contains status/statusText/data
      const resp = err.response;
      console.error("Gagal melengkapi registrasi siswa:", {
        status: resp?.status,
        statusText: resp?.statusText,
        data: resp?.data,
        message: err.message,
      });

      if (resp) {
        const data = resp.data;
        if (data) {
          // tampilkan pesan BE sejelas mungkin
          if (data.errors) {
            const firstKey = Object.keys(data.errors)[0];
            const msg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : JSON.stringify(data.errors[firstKey]);
            setErrorMsg(msg || `Validasi gagal (HTTP ${resp.status})`);
          } else if (data.message) {
            setErrorMsg(`${data.message} (HTTP ${resp.status})`);
          } else if (typeof data === 'string') {
            setErrorMsg(`${data} (HTTP ${resp.status})`);
          } else {
            setErrorMsg(`Terjadi kesalahan server (HTTP ${resp.status}): ${JSON.stringify(data)}`);
          }
        } else {
          setErrorMsg(`Terjadi kesalahan (HTTP ${resp.status} ${resp.statusText})`);
        }
      } else {
        setErrorMsg(err.message || 'Tidak dapat terhubung ke server. Cek jaringan atau CORS.');
      }
    } finally {
      setLoading(false);
    }
  };

  // mark manual overrides when user types in email or nama_sekolah
  const emailVal = watch("email");
  const sekolahVal = watch("nama_sekolah");
  useEffect(() => { if (emailVal && String(emailVal).length > 0) emailTouched.current = true; }, [emailVal]);
  useEffect(() => { if (sekolahVal && String(sekolahVal).length > 0) sekolahTouched.current = true; }, [sekolahVal]);

  // Debounced NISN lookup to prefill email and sekolah
  const nisnVal = watch("nisn");
  useEffect(() => {
    const raw = String(nisnVal ?? '');
    const val = raw.replace(/\D/g, '').slice(0, 10); // sanitize locally
    if (val !== raw) setValue('nisn', val, { shouldDirty: true });
    setErrorMsg(null);
    if (nisnTimer.current) clearTimeout(nisnTimer.current);
    // Only proceed when exactly 10 digits
    if (!/^\d{10}$/.test(val)) return;
    nisnTimer.current = setTimeout(async () => {
      try {
        setNisnChecking(true);
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
        const r = await fetch(`${base}/siswa/by-nisn/${encodeURIComponent(val)}`, {
          headers: { Accept: 'application/json' },
        });
        const body = await r.json().catch(() => ({}));
        if (body?.exists && body?.data) {
          const nmSek = body.data.nama_sekolah || '';
          const em = body.data.email || '';
          if (!sekolahTouched.current && nmSek) setValue('nama_sekolah', nmSek, { shouldDirty: true });
          if (!emailTouched.current && em) setValue('email', em, { shouldDirty: true });
        }
      } catch (e: any) {
        console.warn('[formSiswa] lookup NISN gagal', e?.message || e);
      } finally {
        setNisnChecking(false);
      }
    }, 500);
    return () => { if (nisnTimer.current) clearTimeout(nisnTimer.current); };
  }, [nisnVal]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="NISN"
        placeholder="NISN"
        required
        type="text"
        {...register("nisn", {
          required: "NISN wajib diisi",
          pattern: { value: /^\d{10}$/, message: "NISN harus terdiri dari 10 digit angka" },
          setValueAs: (v: any) => String(v ?? '').replace(/\D/g, '').slice(0, 10),
        })}
        error={errors.nisn?.message}
      />
      {nisnChecking && (
        <div className="text-xs text-gray-500 -mt-2 mb-2">Memeriksa NISN…</div>
      )}
      
      <ComboAsalSekolah
        register={register}
        setValue={setValue}
        error={errors.nama_sekolah?.message}
        value={watch('nama_sekolah')}
        disabled
      />

      <Input
        label="Email"
        placeholder="Email"
        required
        type="email"
        {...register("email")}
        error={errors.email?.message}
        disabled
      />

      <Input
        label="Username"
        placeholder="Username"
        required
        type="text"
        {...register("username")}
        error={errors.username?.message}
      />

      <InputPassword
        label="Kata Sandi"
        register={register("password", { required: "Kata sandi wajib diisi" })}
      />

      {/* <div className="flex items-start text-xs text-[#292D32] font-medium">
        <input type="checkbox" className="mr-2 mb-3" />
        <span>Saya menyetujui syarat & ketentuan yang berlaku</span>
      </div> */}

      <Button type="submit" className="w-full mb-3" disabled={loading}>
        {loading ? "Mengirim..." : "Daftar"}
      </Button>

      {errorMsg && <div className="text-red-600 text-sm mb-3">{errorMsg}</div>}

      <p className="text-xs text-center text-gray-600 mb-3">
        Sudah punya akun?{" "}
        <a
          href="/login"
          className="text-[#0F67B1] font-semibold hover:underline"
        >
          Masuk
        </a>
      </p>
      {showSuccessPopup && redirectInfo && (
        <SuccesModal
          open={showSuccessPopup}
          title="Berhasil"
          message="Pendaftaran akun berhasil! Silakan periksa email Anda untuk memasukkan kode OTP."
          showCloseIcon 
          onClose={() => {
            setShowSuccessPopup(false);
            window.location.href = `/otp?email=${encodeURIComponent(
              redirectInfo.email
            )}&role=${redirectInfo.role}`;
          }}
        />
      )}
    </form>
  );
}
