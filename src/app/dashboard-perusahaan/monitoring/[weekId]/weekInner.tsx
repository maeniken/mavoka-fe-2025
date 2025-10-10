"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import DetailHeader from "@/app/components/dashboard/siswa/laporan-evaluasi/detailHeader";
import LogsTable, { DetailLog } from "@/app/components/dashboard/siswa/laporan-evaluasi/logsTable";

export default function Content() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();

  const weekId = (params?.weekId as string) ?? "week-1";
  const laporanId = search.get("laporanId") ?? undefined;

  const weekNumber = useMemo(() => {
    const n = Number(String(weekId).replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [weekId]);

  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<DetailLog[]>([]);
  const [evaluation, setEvaluation] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setLogs([{ date:"2026-08-01", photoUrl:"/images/report.png", activity:"Orientasi & pengenalan lingkungan kerja. Administrasi surat-menyurat.", output:"Arsip dokumen nbhb", obstacle:"Adaptasi SOP", solution:"Belajar SOP, minta arahan mentor" }]);
      setEvaluation(""); setIsLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [laporanId, weekId]);

  const onSaveEvaluation = () => {
    console.log("Simpan evaluasi perusahaan →", { laporanId, weekId, evaluation });
  };

  return (
    <DashboardLayout2>
      <div className="p-3 -mt-2">
        <button onClick={() => router.back()} className="-ml-5 mt-2 mb-2 inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none">
          <IoIosArrowRoundBack size={25} /><span className="text-xl font-semibold">Kembali</span>
        </button>

        <DetailHeader weekNumber={weekNumber} isDone={true} weekId={weekId} showBack={false} showAdd={false} />

        <div className="mt-4">
          <LogsTable logs={logs} canAdd={false} />
        </div>

        <div className="mt-4">
          <h3 className="mb-3 text-gray-900">Evaluasi Perusahaan</h3>
          <textarea value={evaluation} onChange={(e) => setEvaluation(e.target.value)} className="w-full rounded-md border px-3 py-2 min-h-[120px] focus:ring-2 focus:ring-[#0F67B1]" />
          <div className="mt-3 flex justify-end">
            <button onClick={onSaveEvaluation} className="rounded-[5px] bg-[#0F67B1] px-4 py-2 text-white hover:bg-[#0c599b]">Unggah</button>
          </div>
        </div>
      </div>
    </DashboardLayout2>
  );
}
