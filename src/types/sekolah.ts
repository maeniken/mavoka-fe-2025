export type Sekolah = {
  id: number | string;
  nama: string; // nama_sekolah
  alamat?: string | null;
  logoUrl?: string | null;
  web?: string | null;
};

export type SekolahRaw = {
  id: number | string;
  nama_sekolah?: string;
  alamat?: string | null;
  logo_sekolah?: string | null;
  logo_url?: string | null;
  web_sekolah?: string | null;
};
