import axios from "axios";
import { Company } from "@/types/company";

type RawCompany = {
  id: number | string;
  nama_perusahaan?: string;
  name?: string;
  alamat?: string;
  address?: string;
  logo?: string;
  logo_url?: string;
  slug?: string;
  deskripsi_usaha?: string;
  email?: string;
  total_lowongan?: number;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000",
  timeout: 15000,
});

// Ambil semua perusahaan
export async function getAllPerusahaan(): Promise<Company[]> {
  // Endpoint publik baru: /api/perusahaan/all
  const { data } = await api.get<{ data?: RawCompany[] }>("/api/perusahaan/all");
  const rows: RawCompany[] = (data as any)?.data ?? [];
  return rows.map<Company>((r) => {
    // Prioritaskan path relatif karena logo_url dari backend tidak selalu benar
    // Ekstrak path relatif dari logo_url jika ada, atau gunakan logo
    let logoPath = r.logo;
    if (r.logo_url && r.logo_url.includes('/')) {
      // Ekstrak path setelah domain jika logo_url adalah full URL
      const match = r.logo_url.match(/https?:\/\/[^\/]+\/(.+)$/);
      if (match) {
        logoPath = match[1]; // ambil bagian path saja
      }
    }
    
    return {
      id: r.id,
      name: r.nama_perusahaan ?? r.name ?? "Perusahaan",
      address: r.alamat ?? r.address ?? "-",
      logoUrl: logoPath || "/assets/img/placeholder-logo.png",
      slug: r.slug,
      description: r.deskripsi_usaha,
      web: (r as any).web_perusahaan,
    };
  });
}

// Ambil detail perusahaan
export async function getDetailPerusahaan(id: string | number): Promise<Company | null> {
  try {
  // Gunakan endpoint detail publik yang sudah ada
  const { data } = await api.get<{ success?: boolean; data?: RawCompany }>(`/api/perusahaan/detail/${id}`);
  const r: any = data?.data ?? data;

    // Prioritaskan path relatif karena logo_url dari backend tidak selalu benar
    let logoPath = r.logo;
    if (r.logo_url && r.logo_url.includes('/')) {
      // Ekstrak path setelah domain jika logo_url adalah full URL
      const match = r.logo_url.match(/https?:\/\/[^\/]+\/(.+)$/);
      if (match) {
        logoPath = match[1]; // ambil bagian path saja
      }
    }

    return {
      id: r.id,
      name: r.nama_perusahaan ?? r.name ?? "Perusahaan",
      address: r.alamat ?? r.address ?? "-",
      logoUrl: logoPath ?? "/assets/img/placeholder-logo.png",
      slug: r.slug,
      description: r.deskripsi_usaha ?? "",
      email: r.email ?? "",
      totalLowongan: r.total_lowongan,
    };
  } catch {
    return null;
  }
}
