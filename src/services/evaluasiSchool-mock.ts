// app/data/evaluasi/school.mock.ts
import { StudentEvalListItem } from "@/types/evaluasi-sekolah";

/** =========================
 *  Dummy datasets
 *  ========================= */
const NAMES = [
  "Lisa Mariana",
  "Rafi Prayoga",
  "Nadia Putri",
  "Dewi Anggraini",
  "Fikri Ahmad",
  "Salsa Ayu",
  "Bima Arya",
  "Alya Maharani",
  "Kevin Saputra",
  "Damar Prakoso",
  "Farah Lestari",
  "Irwan Kurnia",
];

const MAJORS = [
  "Otomatisasi Dan Tata Kelola Perkantoran",
  "Rekayasa Perangkat Lunak",
  "Teknik Komputer & Jaringan",
  "Akuntansi",
];

const COMPANIES = [
  "PT. Bank Mandiri Tbk (Persero)",
  "PT. Telkom Indonesia (Persero) Tbk",
  "PT. Astra International Tbk",
  "PT. Kimia Farma Tbk",
];

/** =========================
 *  Types (exported)
 *  ========================= */
export type GetStudentsParams = {
  major?: string;
  /** Boleh langsung label human-readable (mis. "1 Juli 2026 – 31 Agustus 2026") */
  period?: string;
  page?: number;
  perPage?: number;
};

export type StudentHeader = {
  studentId: string;
  position: string;
  company: string;
  periodLabel: string;
};

export type WeekSummary = {
  weekId: string;
  weekNumber: number; // 1..n
  coverImage?: string;
  progress: number; // 0..100
  hasReport: boolean;
  hasGrade: boolean;
};

export type WeekHeader = {
  weekId: string;
  position: string;
  company: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
};

export type GradeAspect = {
  aspect: string;
  criteria: string[];
  score: number; // 0..100
};

/** Helper */
function buildPeriodLabel(period?: string) {
  return period ?? "1 Juli 2026 – 31 Agustus 2026";
}

/** =========================
 *  API (mock)
 *  ========================= */

/** List siswa (halaman depan) */
export async function getStudents({
  major,
  period,
  page = 1,
  perPage = 10,
}: GetStudentsParams): Promise<{ rows: StudentEvalListItem[]; total: number }> {
  // generate 87 dummy rows
  const all: StudentEvalListItem[] = Array.from({ length: 87 }).map((_, i) => {
    const m = MAJORS[i % MAJORS.length];
    const c = COMPANIES[i % COMPANIES.length];
    return {
      id: `stu_${i + 1}`,
      name: NAMES[i % NAMES.length],
      periodLabel: buildPeriodLabel(period),
      major: m,
      company: c,
      finalScore: 72,
    };
  });

  const filtered = all.filter((r) => (!major ? true : r.major === major));

  const start = (page - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  return new Promise((resolve) =>
    setTimeout(() => resolve({ rows, total: filtered.length }), 200)
  );
}

/** Header info untuk halaman ringkasan minggu (per siswa) */
export async function getStudentHeader(studentId: string): Promise<StudentHeader> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          studentId,
          position: "Administrasi Perkantoran",
          company: "PT. Bank Mandiri Tbk (Persero)",
          periodLabel: "1 Juli 2026 – 31 Agustus 2026",
        }),
      150
    )
  );
}

/** Daftar minggu untuk siswa tertentu */
export async function getStudentWeeks(studentId: string): Promise<WeekSummary[]> {
  const weeks: WeekSummary[] = Array.from({ length: 7 }).map((_, i) => ({
    weekId: `w_${studentId}_${i + 1}`,
    weekNumber: i + 1,
    coverImage: "/images/sample-thumb.jpg",
    progress: 30 + ((i * 10) % 70),
    hasReport: true,
    hasGrade: i % 2 === 0,
  }));

  return new Promise((resolve) => setTimeout(() => resolve(weeks), 220));
}

/** Header untuk halaman NILAI (berdasarkan weekId) */
export async function getWeekHeader(weekId: string): Promise<WeekHeader> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          weekId,
          position: "Administrasi Perkantoran",
          company: "PT. Bank Mandiri tbk (Persero)",
          periodStart: "2026-07-01",
          periodEnd: "2026-08-31",
        }),
      180
    )
  );
}

/** Daftar nilai per aspek (berdasarkan weekId) */
export async function getWeeklyGrades(weekId: string): Promise<GradeAspect[]> {
  const grades: GradeAspect[] = [
    {
      aspect: "Disiplin",
      criteria: ["Datang tepat waktu", "Mematuhi aturan perusahaan"],
      score: 82,
    },
    {
      aspect: "Tanggung Jawab",
      criteria: ["Menyelesaikan tugas", "Meminimalisir kesalahan"],
      score: 85,
    },
    {
      aspect: "Komunikasi",
      criteria: ["Komunikasi efektif", "Sopan & jelas saat menyampaikan"],
      score: 80,
    },
    {
      aspect: "Kerja Sama",
      criteria: ["Kolaborasi tim", "Berbagi informasi"],
      score: 88,
    },
    {
      aspect: "Inisiatif",
      criteria: ["Proaktif mencari tugas", "Memberi saran perbaikan"],
      score: 78,
    },
    {
      aspect: "Kerapihan",
      criteria: ["Kerapihan dokumen", "Kebersihan area kerja"],
      score: 86,
    },
  ];

  return new Promise((resolve) => setTimeout(() => resolve(grades), 220));
}

// === Types untuk halaman DETAIL ===
export type DailyReport = {
  date: string;       // "YYYY-MM-DD"
  activity: string;
  output: string;
  obstacle?: string;
  solution?: string;
  photoUrl?: string;
};

export type CompanyEvaluation = {
  summary: string;    // ringkasan evaluasi
  points?: string[];  // butir-butir evaluasi
  reviewer?: string;  // opsional
  reviewedAt?: string;// opsional "YYYY-MM-DD"
};

// === Mock API untuk halaman DETAIL ===
export async function getWeeklyDailyReports(weekId: string): Promise<DailyReport[]> {
  const rows: DailyReport[] = [
    {
      date: "2026-07-01",
      activity: "Menyusun arsip surat masuk dan keluar unit.",
      output: "Terbentuk daftar arsip digital minggu 1.",
      obstacle: "Beberapa dokumen tidak memiliki nomor agenda.",
      solution: "Konfirmasi ke atasan untuk penomoran retroaktif.",
      photoUrl: "/images/sample-thumb.jpg",
    },
    {
      date: "2026-07-02",
      activity: "Input data vendor ke spreadsheet kontrol.",
      output: "20 entri vendor tervalidasi.",
      obstacle: "Duplikasi entri lama.",
      solution: "Gunakan UNIQUE() dan validasi manual.",
    },
    {
      date: "2026-07-03",
      activity: "Membuat notulen rapat divisi.",
      output: "Notulen disetujui supervisor.",
    },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(rows), 200));
}

export async function getWeeklyCompanyEvaluation(
  weekId: string
): Promise<CompanyEvaluation> {
  const evalData: CompanyEvaluation = {
    summary:
      "Siswa menunjukkan konsistensi kehadiran dan ketelitian. Perlu meningkatkan inisiatif update progres.",
    points: [
      "Disiplin: baik, hadir tepat waktu.",
      "Ketelitian: baik, minim kesalahan input.",
      "Komunikasi: cukup, tingkatkan inisiatif laporan.",
    ],
    reviewer: "HR & Supervisor Administrasi",
    reviewedAt: "2026-07-05",
  };
  return new Promise((resolve) => setTimeout(() => resolve(evalData), 220));
}
