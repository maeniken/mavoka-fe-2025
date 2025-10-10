//"use client";
//import { useRouter, useSearchParams } from "next/navigation";
//import Image from "next/image";
//import { useMemo } from "react";
//import { HiUser } from "react-icons/hi";
//import ProgressDots from "@/app/components/dashboard/siswa/laporan-evaluasi/progres";

//export type CompanyWeek = {
//  id: string;
//  number: number;
//  logs: Array<{ photoUrl?: string; photo?: string; imageUrl?: string }>;
//  status?: "ongoing" | "done";
//  targetDays?: 5 | 6 | 7;
//};

//type Props = {
//  week: CompanyWeek;
//  laporanId?: string; // optional: kalau mau teruskan konteks
//};

//export default function WeekCardCompany({ week, laporanId }: Props) {
//  const router = useRouter();

//  // kalau props laporanId tidak diberikan, cek dari query parent
//  const params = useSearchParams();
//  const fromQuery = params.get("laporanId") ?? undefined;
//  const ctxLaporanId = laporanId ?? fromQuery;
//  const q = ctxLaporanId ? `?laporanId=${encodeURIComponent(ctxLaporanId)}` : "";

//  const filled = week.logs.length;
//  const total =
//    week.status === "done" ? week.targetDays ?? filled : filled === 0 ? 1 : filled;

//  const firstPhotoUrl = useMemo(() => {
//    const firstWithPhoto = (week.logs as any[]).find(
//      (l) => l?.photoUrl || l?.photo || l?.imageUrl
//    );
//    return (
//      (firstWithPhoto?.photoUrl ??
//        firstWithPhoto?.photo ??
//        firstWithPhoto?.imageUrl) as string | undefined
//    );
//  }, [week.logs]);

//  const hasCover = !!firstPhotoUrl;

//  return (
//    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//      <div className="space-y-2">
//        {/* kiri: foto/ikon + judul */}
//        <div className="flex items-center gap-3">
//          <div
//            className={[
//              "relative h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-md bg-gray-50",
//              hasCover ? "" : "ring-1 ring-gray-300",
//            ].join(" ")}
//          >
//            {hasCover ? (
//              <Image
//                src={firstPhotoUrl!}
//                alt={`Cover Minggu ${week.number}`}
//                fill
//                className="object-cover"
//              />
//            ) : (
//              <div className="flex h-full w-full items-center justify-center text-black">
//                <HiUser className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
//              </div>
//            )}
//          </div>

//          <div className="font-semibold text-xl text-gray-900">
//            Minggu {week.number}
//          </div>
//        </div>

//        {/* progres + aksi */}
//        <div className="flex items-end gap-6 sm:gap-6">
//          <div className="flex-1 pt-1">
//            <ProgressDots filled={filled} total={total} />
//          </div>

//          <div className="flex items-center gap-2 self-end">
//            <button
//              onClick={() => router.push(`/dashboard-perusahaan/monitoring/${week.id}/nilai${q}`)}
//              className="h-10 px-4 inline-flex items-center justify-center rounded-[5px] border border-[#0F67B1] text-sm font-medium text-[#0F67B1] bg-white hover:bg-[#0F67B1]/10"
//            >
//              + Nilai
//            </button>
//            <button
//              onClick={() => router.push(`/dashboard-perusahaan/monitoring/${week.id}${q}`)}
//              className="h-10 px-4 inline-flex items-center justify-center rounded-[5px] border border-transparent text-sm font-medium text-white bg-[#0F67B1] hover:bg-blue-700"
//            >
//              Detail
//            </button>
//          </div>
//        </div>
//      </div>
//    </div>
//  );
//}

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useMemo } from "react";
import { HiUser } from "react-icons/hi";
import ProgressDots from "@/app/components/dashboard/siswa/laporan-evaluasi/progres";

export type CompanyWeek = {
  id: string; // weekId
  number: number; // week number (1..n)
  logs: Array<{ photoUrl?: string; photo?: string; imageUrl?: string }>;
  status?: "ongoing" | "done";
  targetDays?: 5 | 6 | 7;
};

type Props = {
  week: CompanyWeek;
  laporanId?: string; // optional: teruskan konteks
  /**
   * NEW: variant untuk override perilaku navigasi & teks tombol
   * - "company" (default): rute /dashboard-perusahaan/monitoring/...
   * - "school": rute /dashboard-sekolah/laporan-evaluasi/minggu/...
   */
  variant?: "company" | "school";
  /**
   * NEW (opsional): custom builder href jika mau override total
   * Jika tidak diberikan, akan pakai default sesuai `variant`.
   */
  buildDetailHref?: (week: CompanyWeek, q: string) => string;
  buildNilaiHref?: (week: CompanyWeek, q: string) => string;
};

export default function WeekCardCompany({
  week,
  laporanId,
  variant = "company",
  buildDetailHref,
  buildNilaiHref,
}: Props) {
  const router = useRouter();

  // kalau props laporanId tidak diberikan, cek dari query parent
  const params = useSearchParams();
  const fromQuery = params.get("laporanId") ?? undefined;
  const ctxLaporanId = laporanId ?? fromQuery;
  const q = ctxLaporanId ? `?laporanId=${encodeURIComponent(ctxLaporanId)}` : "";

  const filled = week.logs.length;
  const total =
    week.status === "done" ? week.targetDays ?? filled : filled === 0 ? 1 : filled;

  const firstPhotoUrl = useMemo(() => {
    const firstWithPhoto = (week.logs as any[]).find(
      (l) => l?.photoUrl || l?.photo || l?.imageUrl
    );
    return (
      (firstWithPhoto?.photoUrl ??
        firstWithPhoto?.photo ??
        firstWithPhoto?.imageUrl) as string | undefined
    );
  }, [week.logs]);

  const hasCover = !!firstPhotoUrl;

  // ====== NEW: default href builder berdasar variant ======
  const defaultDetailHref =
    variant === "company"
      ? `/dashboard-perusahaan/monitoring/${week.id}${q}`
      : `/dashboard-sekolah/laporan-evaluasi/minggu/${week.id}/detail`;
  const defaultNilaiHref =
    variant === "company"
      ? `/dashboard-perusahaan/monitoring/${week.id}/nilai${q}`
      : `/dashboard-sekolah/laporan-evaluasi/minggu/${week.id}/nilai`;

  const toDetail = buildDetailHref ? buildDetailHref(week, q) : defaultDetailHref;
  const toNilai = buildNilaiHref ? buildNilaiHref(week, q) : defaultNilaiHref;

  // ====== NEW: label tombol (company pakai "+ Nilai", school pakai "Nilai") ======
  const nilaiLabel = variant === "company" ? "+ Nilai" : "Nilai";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        {/* kiri: foto/ikon + judul */}
        <div className="flex items-center gap-3">
          <div
            className={[
              "relative h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-md bg-gray-50",
              hasCover ? "" : "ring-1 ring-gray-300",
            ].join(" ")}
          >
            {hasCover ? (
              <Image
                src={firstPhotoUrl!}
                alt={`Cover Minggu ${week.number}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-black">
                <HiUser className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
              </div>
            )}
          </div>

          <div className="font-semibold text-xl text-gray-900">
            Minggu {week.number}
          </div>
        </div>

        {/* progres + aksi */}
        <div className="flex items-end gap-6 sm:gap-6">
          <div className="flex-1 pt-1">
            <ProgressDots filled={filled} total={total} />
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={() => router.push(toNilai)}
              className="h-10 px-4 inline-flex items-center justify-center rounded-[5px] border border-[#0F67B1] text-sm font-medium text-[#0F67B1] bg-white hover:bg-[#0F67B1]/10"
            >
              {nilaiLabel}
            </button>
            <button
              onClick={() => router.push(toDetail)}
              className="h-10 px-4 inline-flex items-center justify-center rounded-[5px] border border-transparent text-sm font-medium text-white bg-[#0F67B1] hover:bg-blue-700"
            >
              Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
