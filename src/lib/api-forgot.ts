import axios from "axios";

// Keep consistent with other modules using NEXT_PUBLIC_API_BASE_URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const USER_BASE = `${API_BASE}/user`;

export type Role = "siswa" | "sekolah" | "perusahaan" | "lpk";

export async function sendForgotOtp(params: { email: string; role?: Role }) {
  const role = params.role || "siswa";
  const res = await axios.post(`${USER_BASE}/forgot-password/${role}`, {
    email: params.email,
  });
  return res.data as {
    message: string;
    email_status?: "sent" | "failed";
    expires_at?: string;
  };
}

export async function resetPasswordApi(params: {
  email: string;
  otp: string;
  new_password: string;
  new_password_confirmation: string;
  role?: Role;
}) {
  const role = params.role || "siswa";
  const res = await axios.post(`${USER_BASE}/reset-password/${role}`, {
    email: params.email,
    otp: params.otp,
    new_password: params.new_password,
    new_password_confirmation: params.new_password_confirmation,
  });
  return res.data as { message: string };
}
