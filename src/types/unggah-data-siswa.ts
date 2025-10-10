//// types/siswa.ts

//// nilai yang umum dipakai di form/backend
//export type JenisKelamin = "L" | "P";
//export type StatusVerifikasi = "sudah" | "belum";

//// field minimal yang diisi di form & template excel
//export interface SiswaInputMinimal {
//  nama_lengkap: string;
//  nisn: string;
//  kelas: string;
//  nama_jurusan: string;
//  tahun_ajaran: string;
//  email: string;
//}

//// payload lengkap sesuai rules backend (nullable di backend tetap opsional di sini)
//export interface UploadSiswaSinglePayload extends SiswaInputMinimal {
//  sekolah_id: number;

//  username?: string | null;
//  password?: string | null;
//  tanggal_lahir?: string | null;     // "YYYY-MM-DD"
//  jenis_kelamin?: JenisKelamin | "" | null;
//  alamat?: string | null;
//  kontak?: string | null;
//  status_verifikasi?: StatusVerifikasi | null;
//  tanggal_verifikasi?: string | null; // "YYYY-MM-DD"
//}

//// (opsional) bentuk respons umum dari API Laravel
//export type ApiErrorBag = Record<string, string[]>;
//export interface ApiErrorResponse {
//  message: string;
//  errors?: ApiErrorBag;
//}


// types/siswa.ts

export type JenisKelamin = "L" | "P";
export type StatusVerifikasi = "sudah" | "belum";

/** Field minimal yang kalian isi di form & template */
export interface SiswaInputMinimal {
  nama_lengkap: string;
  nisn: string;
  kelas: string;
  nama_jurusan: string;
  tahun_ajaran: string;
  email: string;
}

/** Payload lengkap untuk endpoint upload-siswa-single */
export interface UploadSiswaSinglePayload extends SiswaInputMinimal {
  sekolah_id: number;

  username?: string | null;
  password?: string | null;
  tanggal_lahir?: string | null;        // "YYYY-MM-DD"
  jenis_kelamin?: JenisKelamin | "" | null;
  alamat?: string | null;
  kontak?: string | null;
  status_verifikasi?: StatusVerifikasi | null;
  tanggal_verifikasi?: string | null;   // "YYYY-MM-DD"
}

/** (opsional) bentuk error Laravel */
export type ApiErrorBag = Record<string, string[]>;
export interface ApiErrorResponse {
  message?: string;
  errors?: ApiErrorBag;
}

//data-siswa
export interface SiswaRecord extends UploadSiswaSinglePayload {
  id: number;
  created_at?: string | null;
  updated_at?: string | null;

  // Optional flags untuk logika "status akun"
  registered_at?: string | null;
  last_login_at?: string | null;
}

/** ---- Status Akun (UI) ---- */
export type StatusAkun = "Aktif" | "Tidak";

/** ---- Row untuk tabel daftar siswa (UI list page) ---- */
export interface StudentRow {
  id: number;
  nama: string;
  jurusan: string;
  tahunAjaran: string;
  statusAkun: StatusAkun;
}

/** ---- Status lamaran (detail) :
 * selaraskan dengan dashboard siswa.
 * Sediakan alias 'Wawancara' ↔ 'Interview' agar fleksibel di data.
 */
export type ApplicationStatus =
  | "Lamar"
  | "Interview"
  | "Wawancara"
  | "Penawaran"
  | "Diterima"
  | "Ditolak";

/** ---- Item tabel detail siswa (riwayat pengajuan magang) ---- */
export interface StudentApplicationDetail {
  id: number;                 // id lamaran
  namaSiswa: string;
  jurusan: string;
  tahunAjaran: string;
  perusahaan: string;
  divisiPenempatan: string;
  status: ApplicationStatus;
}

/** ================= Helpers (mapping & logic) ================= */

/** Tentukan 'Aktif' bila siswa sudah registrasi / pernah login / sudah terverifikasi */
export const deriveStatusAkun = (s: SiswaRecord): StatusAkun => {
  const verified = s.status_verifikasi === "sudah";
  const registered = Boolean(s.registered_at);
  const loggedIn = Boolean(s.last_login_at);
  return verified || registered || loggedIn ? "Aktif" : "Tidak";
};

/** Mapper dari SiswaRecord → StudentRow (untuk tabel list) */
export const mapSiswaToRow = (s: SiswaRecord): StudentRow => ({
  id: s.id,
  nama: s.nama_lengkap,
  jurusan: s.nama_jurusan,
  tahunAjaran: s.tahun_ajaran,
  statusAkun: deriveStatusAkun(s),
});