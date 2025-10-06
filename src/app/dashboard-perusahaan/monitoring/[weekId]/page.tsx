"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

// reuse komponen siswa (tampilan sama), tapi diset read-only di perusahaan
import DetailHeader from "@/app/components/dashboard/siswa/laporan-evaluasi/detailHeader";
import LogsTable, {
  DetailLog,
} from "@/app/components/dashboard/siswa/laporan-evaluasi/logsTable";

export default function WeekDetailCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();

  // /monitoring/[weekId]
  const weekId = (params?.weekId as string) ?? "week-1";
  const laporanId = search.get("laporanId") ?? undefined;

  // derive nomor minggu dari slug
  const weekNumber = useMemo(() => {
    const n = Number(String(weekId).replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [weekId]);

  // state dummy (ganti ke fetch API saat endpoint siap)
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<DetailLog[]>([]);
  const [evaluation, setEvaluation] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => {
      setLogs([
        {
          date: "2026-08-01",
          photoUrl: "/images/report.png",
          activity:
            "Orientasi & pengenalan lingkungan kerja. Administrasi surat-menyurat.",
          output: "Arsip dokumen dan rangkuman harian divisi administrasi.",
          obstacle: "Adaptasi SOP & sistem internal perusahaan.",
          solution:
            "Belajar SOP, minta arahan mentor, catat hal penting agar tidak terulang.",
        },
      ]);
      setEvaluation("");
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [laporanId, weekId]);

  const onSaveEvaluation = () => {
    // TODO: ganti ke POST/PUT ke backend
    console.log("Simpan evaluasi perusahaan →", {
      laporanId,
      weekId,
      evaluation,
    });
  };

  return (
    <DashboardLayout2>
      {/* hilangkan padding kiri supaya rata dengan header */}
      <div className="px-4 md:px-6">
        {/* Tombol kembali (punya halaman perusahaan) */}
        <button
          onClick={() => router.back()}
          className="-ml-5 mt-2 mb-2 inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none"
        >
          <IoIosArrowRoundBack size={25} />
          <span className="text-xl font-semibold">Kembali</span>
        </button>

        {/* Header Siswa dipakai ulang, tapi TANPA tombol kembali & TANPA 'Isi Laporan' */}
        <DetailHeader
          weekNumber={weekNumber}
          isDone={true}        // tidak dipakai karena showAdd=false
          weekId={weekId}
          showBack={false}     // hindari double back button
          showAdd={false}      // perusahaan tidak boleh isi laporan
        />

        {/* Tabel log: read-only, tanpa ajakan 'Klik Isi Laporan' */}
        <div className="mt-4">
          <LogsTable logs={logs} canAdd={false} />
        </div>

        {/* Evaluasi perusahaan (satu-satunya input di halaman ini) */}
        <div className="mt-4">
          <h3 className="mb-3 text-gray-900">
            Evaluasi Perusahaan
          </h3>

          <textarea
            value={evaluation}
            onChange={(e) => setEvaluation(e.target.value)}
            placeholder="Masukkan evaluasi mingguan siswa di sini…"
            className="w-full rounded-md border px-3 py-2 min-h-[120px] outline-none focus:ring-2 focus:ring-[#0F67B1]"
          />

          <div className="mt-3 flex justify-end">
            <button
              onClick={onSaveEvaluation}
              className="rounded-[5px] bg-[#0F67B1] px-4 py-2 text-white hover:bg-[#0c599b]"
            >
              Unggah
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout2>
  );
}
