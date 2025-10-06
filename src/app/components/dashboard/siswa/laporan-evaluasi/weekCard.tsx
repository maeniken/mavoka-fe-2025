"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { HiUser } from "react-icons/hi"; // ← tambahkan
import type { WeekReport } from "@/types/laporan-siswa";
import ProgressDots from "./progres";

export default function WeekCard({ week }: { week: WeekReport }) {
  const filled = week.logs.length;
  const total =
    week.status === "done" ? (week.targetDays ?? filled) : (filled === 0 ? 1 : filled);

  // Ambil foto pertama dari log
  const firstPhotoUrl = useMemo(() => {
    const firstWithPhoto = (week.logs as any[]).find(
      (l) => l?.photoUrl || l?.photo || l?.imageUrl
    );
    return (firstWithPhoto?.photoUrl ?? firstWithPhoto?.photo ?? firstWithPhoto?.imageUrl) as
      | string
      | undefined;
  }, [week.logs]);

  const hasCover = !!firstPhotoUrl;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        {/* Baris 1: foto/ikon + judul */}
        <div className="flex items-center gap-3">
          <div
            className={[
              "relative h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-md bg-gray-50",
              hasCover ? "" : "ring-1 ring-gray-300",
            ].join(" ")}
          >
            {hasCover ? (
              <Image src={firstPhotoUrl!} alt={`Cover Minggu ${week.number}`} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-black">
                <HiUser className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
              </div>
            )}
          </div>

          <div className="font-semibold text-xl text-gray-900">Minggu {week.number}</div>
        </div>

        {/* Baris 2: progres (kiri) + tombol (kanan) */}
        <div className="flex items-end gap-6 sm:gap-6">
          <div className="flex-1 pt-1">
            <ProgressDots filled={filled} total={total} />
          </div>

          <div className="flex items-center gap-2 self-end">
            <Link
              href={`/dashboard-siswa/laporan-evaluasi/${week.id}/nilai`}
              className="h-10 px-4 inline-flex items-center justify-center rounded-[5px]
                         border border-[#0F67B1] text-sm font-medium
                         text-[#0F67B1] bg-white hover:bg-[#0F67B1]/10"
            >
              Nilai
            </Link>
            <Link
              href={`/dashboard-siswa/laporan-evaluasi/${week.id}`}
              className="h-10 px-4 inline-flex items-center justify-center rounded-[5px]
                         border border-transparent text-sm font-medium
                         text-white bg-[#0F67B1] hover:bg-blue-700"
            >
              Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
