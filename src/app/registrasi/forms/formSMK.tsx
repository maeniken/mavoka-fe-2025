"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import Input from "@/app/components/registrasi/input";
import ComboAsalSekolah from "@/app/components/registrasi/comboAsalSekolah";
import Button from "@/app/components/registrasi/button";
import InputPassword from "@/app/components/registrasi/InputPassword";
import SuccesModal from "@/app/components/registrasi/PopupBerhasil";
import { registerSiswa } from "@/lib/api-auth";
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

  const onSubmit = async (data: FormValues) => {
    const mappedData: RegisterSiswa = {
      username: data.username,
      email: data.email,
      password: data.password,
      nisn: data.nisn,
      nama_sekolah: data.nama_sekolah,
    };

    try {
      setLoading(true);
      const res = await registerSiswa(mappedData);
      console.log("Respon:", res.data);
      setRedirectInfo({ email: data.email, role: "siswa" });
      setShowSuccessPopup(true);
      reset();
      setErrorMsg(null);
    } catch (err: any) {
      // axios error shape: err.response contains status/statusText/data
      const resp = err.response;
      console.error("Gagal mendaftar siswa:", {
        status: resp?.status,
        statusText: resp?.statusText,
        data: resp?.data,
        message: err.message,
      });

      if (resp) {
        const data = resp.data;
        if (data) {
          if (data.errors) {
            const firstKey = Object.keys(data.errors)[0];
            const msg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : JSON.stringify(data.errors[firstKey]);
            setErrorMsg(msg || `Validasi gagal (HTTP ${resp.status})`);
          } else if (data.message) {
            setErrorMsg(`${data.message} (HTTP ${resp.status})`);
          } else {
            setErrorMsg(`Terjadi kesalahan server (HTTP ${resp.status}): ${JSON.stringify(data)}`);
          }
        } else {
          setErrorMsg(`Terjadi kesalahan (HTTP ${resp.status} ${resp.statusText})`);
        }
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan saat mendaftar siswa.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ComboAsalSekolah
        register={register}
        setValue={setValue}
        error={errors.nama_sekolah?.message}
      />

      <Input
        label="NISN"
        placeholder="NISN"
        required
        type="text"
        {...register("nisn")}
        error={errors.nisn?.message}
      />

      <Input
        label="Email"
        placeholder="Email"
        required
        type="email"
        {...register("email")}
        error={errors.email?.message}
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
