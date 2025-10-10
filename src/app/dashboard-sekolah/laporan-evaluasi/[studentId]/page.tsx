//"use client";

//import { useEffect, useState } from "react";
//import { useRouter, useSearchParams } from "next/navigation";
//import { IoIosArrowRoundBack } from "react-icons/io";
//import HeaderBar from "@/app/components/dashboard/siswa/laporan-evaluasi/headerBar";
//import WeekCardCompany, {
//  CompanyWeek,
//} from "@/app/components/dashboard/perusahaan/monitoring/WeekCardCompany";
//import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

//// (kalau mau pakai mock header dari service, tinggal import & fetch)
//type HeaderInfo = {
//  position: string | null;
//  company: string | null;
//  periodStart: string | Date | null;
//  periodEnd: string | Date | null;
//};

//export default function Page() {
//  const router = useRouter();
//  const search = useSearchParams();

//  // diteruskan dari tabel list siswa (opsional)
//  const laporanId = search.get("laporanId") ?? undefined;

//  // loading skeleton utk header
//  const [isLoading, setIsLoading] = useState(true);
//  const [header, setHeader] = useState<HeaderInfo>({
//    position: null,
//    company: null,
//    periodStart: null,
//    periodEnd: null,
//  });

//  // Dummy weeks — nanti ganti ke fetch by studentId
//  const [weeks, setWeeks] = useState<CompanyWeek[]>([]);

//  useEffect(() => {
//    // Simulasi fetch
//    const t = setTimeout(() => {
//      setHeader({
//        position: "Administrasi Perkantoran",
//        company: "PT. Bank Mandiri tbk (Persero)",
//        periodStart: "2026-07-01",
//        periodEnd: "2026-08-31",
//      });
//      setWeeks(
//        Array.from({ length: 6 }, (_, i) => ({
//          id: `week-${i + 1}`, // weekId
//          number: i + 1,
//          logs: [],
//          status: "ongoing",
//          targetDays: 5,
//        }))
//      );
//      setIsLoading(false);
//    }, 400);
//    return () => clearTimeout(t);
//  }, [laporanId]);

//  return (
//    <DashboardLayout2>
//      <div className="p-3">
//        {/* Button Kembali */}
//        <button
//          onClick={() => router.back()}
//          className="inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none"
//        >
//          <IoIosArrowRoundBack size={25} />
//          <span className="text-xl font-semibold">Kembali</span>
//        </button>

//        {/* Header */}
//        <HeaderBar
//          isLoading={isLoading}
//          showAdd={false}
//          onAdd={() => {}}
//          position={header.position}
//          company={header.company}
//          periodStart={header.periodStart}
//          periodEnd={header.periodEnd}
//        />

//        {/* List Minggu */}
//        <div className="bg-white rounded-md p-4 space-y-4">
//          {weeks.map((w) => (
//            <WeekCardCompany
//              key={w.id}
//              week={w}
//              laporanId={laporanId}
//              variant="school" // ⬅️ pakai rute sekolah
//            />
//          ))}
//        </div>
//      </div>
//    </DashboardLayout2>
//  );
//}

import { Suspense } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import Content from "./studentInner";

export default function Page() {
  return (
    <DashboardLayout2>
      <Suspense fallback={<div className="p-3">Memuat laporan evaluasi…</div>}>
        <Content />
      </Suspense>
    </DashboardLayout2>
  );
}
