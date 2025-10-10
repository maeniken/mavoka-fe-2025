import axios from "axios";
import type { UploadSiswaSinglePayload } from "@/types/unggah-data-siswa";

const API_ROOT =
  (process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000").replace(/\/+$/, "");

const api = axios.create({ baseURL: `${API_ROOT}/api` });

function requireSekolahAuthHeader() {
  if (typeof window === "undefined") {
    throw new Error("requireSekolahAuthHeader hanya boleh dipanggil di client.");
  }

  const token =
    localStorage.getItem("access_token_sekolah") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) {
    throw new Error("Token sekolah tidak ditemukan. Silakan login sebagai SEKOLAH dulu.");
  }
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
}

export const uploadSiswaBulk = (file: File, sekolah_id: number) => {
  const fd = new FormData();
  fd.append("excel", file);      
  fd.append("file", file);       
  fd.append("sekolah_id", String(sekolah_id));

  const headers = requireSekolahAuthHeader();
  return api.post("/sekolah/upload-siswa-bulk", fd, { headers });
};

export const uploadSiswaSingle = (data: UploadSiswaSinglePayload) => {
  const headers = requireSekolahAuthHeader(); 
  return api.post("/sekolah/upload-siswa-single", data, { headers });
};
