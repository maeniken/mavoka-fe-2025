"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import HeaderBar from "@/app/components/dashboard/siswa/laporan-evaluasi/headerBar";
import WeekCardCompany, { CompanyWeek } from "@/app/components/dashboard/perusahaan/monitoring/WeekCardCompany";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

export default function Content() {
  const router = useRouter();
  const search = useSearchParams();
  const laporanId = search.get("laporanId") ?? undefined;

  const [isLoading, setIsLoading] = useState(true);
  const [header, setHeader] = useState({
    position: null, company: null, periodStart: null, periodEnd: null,
  } as { position: string|null; company: string|null; periodStart: string|Date|null; periodEnd: string|Date|null; });

  const [weeks, setWeeks] = useState<CompanyWeek[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setHeader({ position:"Administrasi Perkantoran", company:"PT. Bank Mandiri tbk (Persero)", periodStart:"2026-07-01", periodEnd:"2026-08-31" });
      setWeeks(Array.from({ length: 6 }, (_, i) => ({ id:`week-${i+1}`, number:i+1, logs:[], status:"ongoing", targetDays:5 })));
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [laporanId]);

  return (
    <DashboardLayout2>
      <div className="p-3">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none -ml-4">
          <IoIosArrowRoundBack size={25} /><span className="text-xl font-semibold">Kembali</span>
        </button>

        <HeaderBar isLoading={isLoading} showAdd={false} onAdd={() => {}} {...header} />

        <div className=" space-y-4">
          {weeks.map((w) => <WeekCardCompany key={w.id} week={w} laporanId={laporanId} />)}
        </div>
      </div>
    </DashboardLayout2>
  );
}
