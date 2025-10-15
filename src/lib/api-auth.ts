import axios from "axios";
import { RegisterSekolah, RegisterSiswa, RegisterPerusahaan, RegisterLembaga, Login } from "@/types/user";

// Use the same env as other API calls to keep consistency
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
const USER_BASE = `${API_BASE}/user`;

console.log(USER_BASE); // e.g., http://localhost:8000/api/user


export const registerSekolah = (data: RegisterSekolah) => {
  return axios.post(`${USER_BASE}/register/sekolah`, data);
};

export const registerSiswa = (data: RegisterSiswa) => {
  return axios.post(`${USER_BASE}/register/siswa`, data);
};

// Lengkapi registrasi siswa: sekolah sudah mendaftarkan siswa lebih dulu,
// siswa hanya melengkapi username & password berdasarkan NISN yang sudah ada.
export const lengkapiRegistrasiSiswa = (data: { nisn: string; username: string; password: string; password_confirmation?: string; nama_sekolah: string; email: string; }) => {
  return axios.post(`${USER_BASE}/siswa/lengkapi-registrasi`, data);
};

export const registerPerusahaan = (data: RegisterPerusahaan) => {
  return axios.post(`${USER_BASE}/register/perusahaan`, data);
};

export const registerLembaga = (data: RegisterLembaga) => {
  return axios.post(`${USER_BASE}/register/lpk`, data);
};

export const login = (data: Login) => {
  return axios.post(`${USER_BASE}/login/${data.role}`, data);
};
