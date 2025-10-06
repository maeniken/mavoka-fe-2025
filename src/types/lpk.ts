export type Lpk = {
  id: number | string;
  name: string;              // nama_lembaga
  address: string;           // alamat
  web_lembaga?: string | null;   // web_lembaga
  bidang_pelatihan?: string | null;   // bidang_pelatihan
  deskripsi_lembaga?: string | null;   // deskripsi_lembaga
  logoUrl?: string | null;   // absolute (jika backend sudah kasih lengkap) atau hasil normalisasi
  logoRaw?: string | null;   // path mentah (logo_lembaga / logo_url original) tanpa base untuk fallback builder
  coverUrl?: string | null;  // cover_url (kalau ada)
  slug?: string;
  email?: string;
  username?: string | null;  // username dari tabel lembaga_pelatihan (login)
};

// (opsional) tipe mentah dari API
export type LpkRaw = {
  id: number | string;
  nama_lembaga?: string;
  alamat?: string;
  web_lembaga?: string | null;
  bidang_pelatihan?: string | null;
  deskripsi_lembaga?: string | null; 
  logo_lembaga?: string | null;
  logo_url?: string | null;
  logo?: string | null; // kemungkinan variasi field backend
  cover_url?: string | null;
  slug?: string;
  email?: string;
  username?: string | null; // field username di table
};
