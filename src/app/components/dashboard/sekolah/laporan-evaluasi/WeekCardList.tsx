"use client";
import Link from "next/link";

export type WeekCard = {
  weekId: string;
  weekNumber: number;
  coverImage?: string;
  progress: number;     // 0..100
  hasReport: boolean;
  hasGrade: boolean;
};

type Props = {
  weeks: WeekCard[];
  /** basePath untuk tombol nilai/detail; default rute sekolah */
  buildDetailHref?: (w: WeekCard) => string;
  buildGradeHref?: (w: WeekCard) => string;
};

export default function WeekCardList({
  weeks,
  buildDetailHref = (w) =>
    `/dashboard-sekolah/laporan-evaluasi/minggu/${w.weekId}/detail`,
  buildGradeHref = (w) =>
    `/dashboard-sekolah/laporan-evaluasi/minggu/${w.weekId}/nilai`,
}: Props) {
  return (
    <div className="space-y-3">
      {weeks.map((w) => (
        <div
          key={w.weekId}
          className="bg-white rounded-xl border border-gray-200 px-3 py-3 flex items-center gap-3"
        >
          {/* Thumbnail kecil (opsional) */}
          {w.coverImage ? (
            <img
              src={w.coverImage}
              alt={`Minggu ${w.weekNumber}`}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-gray-200" />
          )}

          {/* Title + progress segmented */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">
              Minggu {w.weekNumber}
            </div>

            {/* segmented progress ala desainmu */}
            <div className="mt-2 flex items-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => {
                const segPct = (i + 1) * (100 / 6);
                const active = w.progress >= segPct - (100 / 6) * 0.4; // sedikit toleransi
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      active ? "bg-[#0F67B1]" : "bg-blue-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={buildGradeHref(w)}
              className="h-9 px-4 rounded-[5px] border border-[#0F67B1] text-[#0F67B1] text-sm font-medium hover:bg-blue-50"
            >
              Nilai
            </Link>
            <Link
              href={buildDetailHref(w)}
              className="h-9 px-4 rounded-[5px] bg-[#0F67B1] text-white text-sm font-medium hover:bg-[#0c599b]"
            >
              Detail
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
