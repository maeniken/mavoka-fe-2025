"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import HeaderBar from "@/app/components/dashboard/siswa/laporan-evaluasi/headerBar";
import WeekCardCompany, { CompanyWeek } from "@/app/components/dashboard/perusahaan/monitoring/WeekCardCompany";

// (kalau mau pakai mock header dari service, tinggal import & fetch)
type HeaderInfo = {
  position: string | null;
  company: string | null;
  periodStart: string | Date | null;
  periodEnd: string | Date | null;
};

export default function Content() {
  const router = useRouter();
  const search = useSearchParams();

  // diteruskan dari tabel list siswa (opsional)
  const laporanId = search.get("laporanId") ?? undefined;

  // loading skeleton utk header
  const [isLoading, setIsLoading] = useState(true);
  const [header, setHeader] = useState<HeaderInfo>({
    position: null,
    company: null,
    periodStart: null,
    periodEnd: null,
  });

  // Dummy weeks — nanti ganti ke fetch by studentId
  const [weeks, setWeeks] = useState<CompanyWeek[]>([]);

  useEffect(() => {
    // Simulasi fetch
    const t = setTimeout(() => {
      setHeader({
        position: "Administrasi Perkantoran",
        company: "PT. Bank Mandiri tbk (Persero)",
        periodStart: "2026-07-01",
        periodEnd: "2026-08-31",
      });
      setWeeks(
        Array.from({ length: 6 }, (_, i) => ({
          id: `week-${i + 1}`, // weekId
          number: i + 1,
          logs: [],
          status: "ongoing",
          targetDays: 5,
        }))
      );
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [laporanId]);

  return (
    <div className="p-4">
      {/* Button Kembali */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none -ml-5 -mt-1"
      >
        <IoIosArrowRoundBack size={25} />
        <span className="text-xl font-semibold">Kembali</span>
      </button>

      {/* Header */}
      <HeaderBar
        isLoading={isLoading}
        showAdd={false}
        onAdd={() => {}}
        position={header.position}
        company={header.company}
        periodStart={header.periodStart}
        periodEnd={header.periodEnd}
      />

      {/* List Minggu */}
      <div className="space-y-4">
        {weeks.map((w) => (
          <WeekCardCompany
            key={w.id}
            week={w}
            laporanId={laporanId}
            variant="school" // ⬅️ pakai rute sekolah
          />
        ))}
      </div>
    </div>
  );
}
