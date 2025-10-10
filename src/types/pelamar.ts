// Status & tipe data pelamar
// Alur: lamar -> wawancara -> penawaran -> (diterima | ditolak)
export type ApplicantStatus = 'lamar' | 'wawancara' | 'penawaran' | 'diterima' | 'ditolak';

export type Position = {
  id: string;
  name: string;
};

export type Applicant = {
  id: string;
  nama: string;
  posisiId: string;
  posisi: string;
  asalSekolah: string;
  jurusan: string;
  email: string;
  cvUrl?: string;
  transkripUrl?: string;
  status: ApplicantStatus;

  fotoUrl?: string;
  nisn?: string;
  noHp?: string;
  alamat?: string;
};

export type InterviewPayload = {
  zoomLink: string;
  waktuText: string;   // contoh: "13.00 - 14.00"
  tanggalISO: string;  // contoh: "2025-07-28"
};
