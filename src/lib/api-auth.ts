import axios from "axios";
import { RegisterSekolah, RegisterSiswa, RegisterPerusahaan, RegisterLembaga, Login } from "@/types/user";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/user`;

console.log(API_BASE_URL); // Output: http://localhost:8000/api/user


export const registerSekolah = (data: RegisterSekolah) => {
  return axios.post(`${API_BASE_URL}/register/sekolah`, data);
};

export const registerSiswa = (data: RegisterSiswa) => {
  return axios.post(`${API_BASE_URL}/register/siswa`, data);
};

export const registerPerusahaan = (data: RegisterPerusahaan) => {
  return axios.post(`${API_BASE_URL}/register/perusahaan`, data);
};

export const registerLembaga = (data: RegisterLembaga) => {
  return axios.post(`${API_BASE_URL}/register/lpk`, data);
};

export const login = (data: Login) => {
  return axios.post(`${API_BASE_URL}/login/${data.role}`, data);
};
