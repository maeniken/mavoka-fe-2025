export type Jurusan = {
  id: number;
  sekolah_id: number;
  nama_jurusan: string;
};

export type School = {
  id: number | string;
  name: string;
  address: string;
  type?: string | null;
  website?: string | null;  // konsisten pakai 'website'
  email?: string | null;
  npsn?: string | null;
  logoUrl?: string | null;  // URL absolut (dari accessor backend logo_url)
  logo_sekolah?: string | null; // path relatif mentah (opsional bila backend ikut kirim)
  slug?: string;
  jurusan?: Jurusan[];
};
