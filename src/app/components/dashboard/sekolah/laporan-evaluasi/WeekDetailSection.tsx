"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";

// Reuse komponen siswa biar tampilannya identik
import DetailHeader from "@/app/components/dashboard/siswa/laporan-evaluasi/detailHeader";
import LogsTable, {
  DetailLog,
} from "@/app/components/dashboard/siswa/laporan-evaluasi/logsTable";

import {
  getWeekHeader,
  getWeeklyDailyReports,
  getWeeklyCompanyEvaluation,
} from "@/services/evaluasiSchool-mock"; // facade (mock/api)

export default function WeekDetailSection({ weekId }: { weekId: string }) {
  const router = useRouter();

  // derive nomor minggu dari slug (sama seperti contohmu)
  const weekNumber = useMemo(() => {
    const n = Number(String(weekId).replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [weekId]);

  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<DetailLog[]>([]);
  const [header, setHeader] = useState<{
    position: string | null;
    company: string | null;
    periodStart: string | Date | null;
    periodEnd: string | Date | null;
  }>({
    position: null,
    company: null,
    periodStart: null,
    periodEnd: null,
  });

  const [evaluation, setEvaluation] = useState<{
    summary: string;
    points?: string[];
    reviewer?: string;
    reviewedAt?: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all([
      getWeekHeader(weekId), // header periode/posisi/perusahaan
      getWeeklyDailyReports(weekId), // laporan harian (LogsTable)
      getWeeklyCompanyEvaluation(weekId), // evaluasi perusahaan (read-only)
    ]).then(([h, daily, evalData]) => {
      if (!mounted) return;

      setHeader({
        position: h.position,
        company: h.company,
        periodStart: h.periodStart,
        periodEnd: h.periodEnd,
      });

      // Bentuk data mock sudah cocok dengan DetailLog → langsung set
      setLogs(daily as unknown as DetailLog[]);
      setEvaluation(evalData as any);

      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [weekId]);

  return (
    <div className="px-4 ">
      {/* Tombol kembali */}
      <button
        onClick={() => router.back()}
        className="-ml-5 mt-2 mb-2 inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none"
      >
        <IoIosArrowRoundBack size={25} />
        <span className="text-xl font-semibold">Kembali</span>
      </button>

      {/* Header (komponen siswa, supaya sama persis tampilannya) */}
      <DetailHeader
        weekNumber={weekNumber}
        isDone={true}
        weekId={weekId}
        showBack={false}
        showAdd={false} // sekolah tidak bisa isi laporan
      />

      {/* Tabel log: read-only, tanpa ajakan 'Klik Isi Laporan' */}
      <div className="mt-4">
        <LogsTable
          logs={logs}
          canAdd={false}
          emptyMessage="Belum ada isi laporan."
        />
      </div>

      {/* Panel Evaluasi Perusahaan (READ-ONLY) */}
      {/* Panel Evaluasi Perusahaan (READ-ONLY) */}
      <div className="mt-5">
        <h3 className="mb-3 text-gray-900">Evaluasi Perusahaan</h3>

        {isLoading ? (
          <div className="text-gray-500 text-sm">Memuat evaluasi…</div>
        ) : evaluation ? (
          // ⬇️ Kotak isi evaluasi dengan border hitam
          <div className="rounded-md border border-black p-4">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {evaluation.summary}
            </p>

            {!!evaluation.points?.length && (
              <ul className="mt-3 list-disc pl-5 space-y-1 text-sm text-gray-800">
                {evaluation.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Belum ada evaluasi perusahaan.
          </div>
        )}
      </div>
    </div>
  );
}
