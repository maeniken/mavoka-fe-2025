"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useReport } from "@/app/components/dashboard/siswa/laporan-evaluasi/reportProvider";
import DetailHeader from "@/app/components/dashboard/siswa/laporan-evaluasi/detailHeader";
import LogsTable, { DetailLog } from "@/app/components/dashboard/siswa/laporan-evaluasi/logsTable";

export default function WeekDetailPage() {
  const { weekID } = useParams<{ weekID: string }>();
  const router = useRouter();
  const { state } = useReport() as any;

  const week = useMemo(
    () => state.weeks.find((w: any) => w.id === weekID),
    [state.weeks, weekID]
  );

  if (!week) {
    return (
      <div className="p-4">
        <button onClick={() => router.push("/dashboard-siswa/laporan-evaluasi")} className="text-[#0F67B1] hover:underline">
          ← Kembali
        </button>
        <p className="mt-3 text-gray-700">Minggu tidak ditemukan.</p>
      </div>
    );
  }

  const isDone = week.status === "done";
  const logs: DetailLog[] = (week.logs as any[]).map((l) => ({
    date: l.date,
    photoUrl: l.photoUrl ?? l.photo ?? l.imageUrl ?? undefined,
    activity: l.activity ?? l.title ?? l.content,
    output: l.output,
    obstacle: l.obstacle,
    solution: l.solution,
  }));

  return (
    <div className="p-3 mt-2">
      <DetailHeader weekNumber={week.number} isDone={isDone} weekId={week.id} />
      <LogsTable logs={logs} />

      {/* Evaluasi perusahaan full width */}
      <div className="mt-6">
        <div className="mb-4 text-xl font-semibold text-gray-900">Evaluasi Perusahaan</div>
        <div className="rounded-xl shadow-sm">
          <textarea
            className="h-56 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
            placeholder="Menunggu evaluasi dari perusahaan…"
            value={week.companyEvaluation ?? ""}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
