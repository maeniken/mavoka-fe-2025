"use client";
import FinalTable from "@/app/components/dashboard/siswa/nilai-akhir/FinalTable";
// import { useReport } from "@/app/components/dashboard/siswa/laporan-evaluasi/reportProvider"; // kalau mau ambil dari provider

export default function NilaiAkhirPage() {
  // TODO: ganti dengan data nyata dari provider/API-mu
  const periodStart = "2026-07-01";
  const periodEnd = "2026-08-31";
  const rows = [
    {
      id: "1",
      studentName: "lisa mariana",
      position: "administrasi perkantoran",
      trainingName: "administrasi perkantoran dasar",
      trainingScore: 72,
      internshipScore: 72,
      certificateUrl: "/mock/cert-lisa.pdf", // ganti ke url dari perusahaan
    },
  ];

  // format periode ke "1 Juli 2026" dsb (sederhana)
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="px-4 md:px-6">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Penilaian Akhir Magang</h2>
      <p className="text-gray-700 mb-4">
        Periode {fmt(periodStart)} - {fmt(periodEnd)}
      </p>

      <FinalTable rows={rows} />
    </div>
  );
}
