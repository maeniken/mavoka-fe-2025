"use client";

import FinalTable from "@/app/components/dashboard/siswa/nilai-akhir/FinalTable";

export default function Content() {
  // data dummy – ganti ke data asli bila siap
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
      certificateUrl: "/mock/cert-lisa.pdf",
    },
  ];

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="p-4">
      <h3 className=" text-gray-900">
        Penilaian Akhir Magang
      </h3>
      <p className="text-gray-700 mb-4">
        Periode {fmt(periodStart)} - {fmt(periodEnd)}
      </p>
      <FinalTable rows={rows} />
    </div>
  );
}
