import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/user`;

export async function verifyOtp({
  email,
  role,
  otp,
}: {
  email: string;
  role: string;
  otp: string;
}) {
  const res = await axios.post(`${API_BASE_URL}/verify-otp/${role}`, {
    email,
    otp,
  });
  return res.data;
}

export async function resendOtp({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const res = await axios.post(`${API_BASE_URL}/resend-otp/${role}`, {
    email,
  });
  return res.data;
}
