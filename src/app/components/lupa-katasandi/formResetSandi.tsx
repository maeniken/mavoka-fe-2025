"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Button from "@/app/components/registrasi/button";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import InputPassword from "@/app/components/registrasi/InputPassword"; // <- path komponenmu
import React from "react";
import { resetPasswordApi } from "@/lib/api-forgot";

type FormValues = {
  password: string;
  confirm: string;
};

export default function FormResetPassword() {
  const router = useRouter();
  const params = useSearchParams();
  // Prefer sessionStorage to avoid exposing secrets in URL, fallback to query if needed.
  const email = (typeof window !== 'undefined' ? sessionStorage.getItem('fp_email') : null) ?? (params.get("email") ?? "");
  const otp = (typeof window !== 'undefined' ? sessionStorage.getItem('fp_otp') : null) ?? (params.get("otp") ?? "");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await resetPasswordApi({
        email,
        otp,
        new_password: values.password,
        new_password_confirmation: values.confirm,
        role: "siswa",
      });
      setOpen(true);
      // Clear sensitive data
      if (typeof window !== 'undefined') {
        try { sessionStorage.removeItem('fp_email'); } catch {}
        try { sessionStorage.removeItem('fp_otp'); } catch {}
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Gagal memperbarui kata sandi";
      setError(msg);
    }
  };

  const handleClose = () => {
    setOpen(false);
    router.replace("/login");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-semibold text-center text-black">
          Kata Sandi Baru
        </h2>
        <p className="text-sm text-center text-gray-400">
          Silahkan buat kata sandi baru untuk akun anda
        </p>

        {error && (
          <p className="text-sm text-center text-red-600">{error}</p>
        )}

        {/* Password baru */}
        <InputPassword
          label="Masukan Kata Sandi Baru"
          placeholder="Kata Sandi Baru"
          register={register("password", {
            required: "Kata sandi wajib diisi",
            minLength: {
              value: 6,
              message: "Minimal 6 karakter",
            },
          })}
          error={errors.password?.message}
        />

        {/* Konfirmasi password */}
        <InputPassword
          label="Konfirmasi Kata Sandi"
          placeholder="Ulangi Kata Sandi"
          register={register("confirm", {
            required: "Konfirmasi wajib diisi",
            validate: (v) =>
              v === watch("password") || "Konfirmasi kata sandi tidak sama",
          })}
          error={errors.confirm?.message}
        />

        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses..." : "Perbaharui Kata Sandi"}
        </Button>
      </form>

      <SuccessModal
        open={open}
        title="Berhasil"
        message={<>Kata sandi Anda berhasil diperbarui!</>}
        onClose={handleClose}
      />
    </>
  );
}
