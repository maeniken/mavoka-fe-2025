// Satu sumber data untuk list & detail

export type StudentRow = {
  id: number;
  nama: string;
  jurusan: string;
  tahunAjaran: string;
  statusAkun: "Aktif" | "Tidak";
};

export type StudentApplicationDetail = {
  id: number;
  namaSiswa: string;
  jurusan: string;
  tahunAjaran: string;
  perusahaan: string;
  divisiPenempatan: string;
  status: "Interview" | "Diterima" | "Ditolak";
};

// Dummy list (96 row seperti di list page)
export const allRows: StudentRow[] = Array.from({ length: 96 }).map((_, i) => ({
  id: i + 1,
  nama: i % 2 === 0 ? "Lisa Mariana" : "Budi Santoso",
  jurusan: "Administrasi Perkantoran",
  tahunAjaran: i % 3 === 0 ? "2024/2025" : "2025/2026",
  statusAkun: (i % 9 === 0 ? "Tidak" : "Aktif"),
}));

// Pemetaan row -> detail (dummy)
export function mapRowToDetail(row: StudentRow): StudentApplicationDetail {
  const perusahaan =
    row.id % 2 === 0 ? "Kantor Notaris & PPAT Yogyakarta" : "Bank Mandiri KC Yogyakarta";
  const divisi =
    row.jurusan === "Administrasi Perkantoran" ? "Administrasi & Pengarsipan" : "Administrasi Perkantoran";
  const status: StudentApplicationDetail["status"] =
    row.id % 5 === 0 ? "Ditolak" : row.id % 3 === 0 ? "Diterima" : "Interview";

  return {
    id: row.id,
    namaSiswa: row.nama,
    jurusan: row.jurusan,
    tahunAjaran: row.tahunAjaran,
    perusahaan,
    divisiPenempatan: divisi,
    status,
  };
}

export function getStudentList() {
  return allRows;
}

export function getStudentDetailById(id: number) {
  const row = allRows.find(r => r.id === id);
  return row ? mapRowToDetail(row) : undefined;
}
