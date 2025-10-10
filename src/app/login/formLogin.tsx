"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/app/components/registrasi/input";
import Button from "@/app/components/registrasi/button";
import InputPassword from "@/app/components/registrasi/InputPassword";
import { login } from "@/lib/api-auth";
import { Login } from "@/types/user";
import { useAuth } from "@/app/components/auth/AuthProvider";

type Role = "siswa" | "sekolah" | "perusahaan" | "lpk" | "admin";

type FormValues = {
  username: string;
  password: string;
  role?: Exclude<Role, "admin">;
};

export default function FormLoginMultiRole({
  fixedRole,
}: {
  fixedRole?: Role;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>();

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken: setSessionToken } = useAuth();

  function redirectByRole(role: Role) {
    if (role === "admin") return router.push("/dashboard-admin");
    return router.push("/");
  }

  // --- helper: ambil ID sesuai role tanpa ubah alur login ---
  function getActorId(user: any, role: Role): number | string | null {
    if (!user) return null;

    const candidatesByRole: Record<Role, string[]> = {
      siswa: ["siswa_id", "id", "user_id"],
      sekolah: ["sekolah_id", "id", "user_id"],
      perusahaan: ["perusahaan_id", "company_id", "id", "user_id"],
      lpk: ["lpk_id", "lembaga_id", "id", "user_id"],
      admin: ["admin_id", "id", "user_id"],
    };

    const keys = candidatesByRole[role] ?? ["id"];
    for (const k of keys) {
      const v = (user as any)?.[k];
      if (typeof v === "number" || typeof v === "string") return v;
    }

    // fallback nested: user.perusahaan.id / user.sekolah.id / dst.
    const nested = (user as any)?.[role];
    if (
      nested &&
      (typeof nested.id === "number" || typeof nested.id === "string")
    ) {
      return nested.id;
    }

    return null;
  }

  const onSubmit = async (data: FormValues) => {
    const hintedRole: Role = (fixedRole ?? data.role) as Role;

    const payload: Login = {
      username: data.username,
      password: data.password,
      role: hintedRole as any,
    };

    try {
      setLoading(true);
      const res = await login(payload);

      const token = res?.data?.token;
      const user = res?.data?.user;
      const serverRole: Role = (res?.data?.role ?? hintedRole) as Role;

      if (token && user && serverRole) {
        const actorId = getActorId(user, serverRole);
        // simpan token & user seperti biasa
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", serverRole);
        try { localStorage.setItem("login_at", String(Date.now())); } catch {}
        localStorage.setItem(
          "actor",
          JSON.stringify({ role: serverRole, id: actorId })
        );
        localStorage.setItem(`access_token_${serverRole}`, token);
        if (actorId != null) localStorage.setItem(`id_${serverRole}`, String(actorId));
        // Set context session cookie+timeout (1 jam)
        setSessionToken(token, 60*60*1000);
      }

      redirectByRole(serverRole);
      reset();
    } catch (err: any) {
      console.error("Login gagal:", err?.response?.data || err?.message || err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      // If account not verified, show admin-verification message
      if (status === 403 && data && data.message && data.message.includes("diverifikasi")) {
        alert("Akun Anda belum diverifikasi. Silakan tunggu verifikasi oleh admin atau hubungi pihak sekolah/administrasi.");
      } else {
        alert("Login gagal. Periksa kembali username, password, dan role Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {!fixedRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Masuk sebagai
          </label>
          <select
            {...register("role", { required: "Role wajib dipilih" })}
            className="w-full border text-xs mb-1 rounded-[6px] px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#0F67B1]"
            defaultValue=""
          >
            <option value="" disabled>
              --Masuk Sebagai--
            </option>
            <option value="siswa">Siswa</option>
            <option value="sekolah">Sekolah</option>
            <option value="perusahaan">Perusahaan</option>
            <option value="lpk">Lembaga Pelatihan</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
          )}
        </div>
      )}

      <Input
        label="Username"
        placeholder="Masukkan username"
        required
        type="text"
        {...register("username", { required: "Username wajib diisi" })}
      />

      <InputPassword
        label="Kata Sandi"
        placeholder="Masukkan kata sandi"
        register={register("password", { required: "Kata sandi wajib diisi" })}
        error={errors.password?.message}
      />

      <p className="text-xs text-right mt-1">
        <a href="/lupa-kataSandi" className="text-[#0F67B1] hover:underline">
          Lupa Kata Sandi?
        </a>
      </p>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Memproses..." : "Masuk"}
      </Button>

      {!fixedRole && (
        <p className="text-xs text-center text-gray-600 mt-2">
          Belum punya akun?{" "}
          <a
            href="/registrasi"
            className="text-[#0F67B1] font-semibold hover:underline text-xs"
          >
            Daftar
          </a>
        </p>
      )}
    </form>
  );
}
