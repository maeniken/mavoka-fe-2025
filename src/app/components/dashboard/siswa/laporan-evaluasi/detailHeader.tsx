"use client";
import Link from "next/link";
import { IoIosArrowRoundBack } from "react-icons/io";

type Props = {
  weekNumber: number;
  isDone: boolean;
  weekId: string;

  /** NEW: tampilkan/ sembunyikan tombol Kembali (default: true) */
  showBack?: boolean;
  /** NEW: href tombol Kembali (default: "/dashboard-siswa/laporan-evaluasi") */
  backHref?: string;

  /** NEW: tampilkan/ sembunyikan tombol "Isi Laporan" (default: true) */
  showAdd?: boolean;
  /** NEW: href tombol "Isi Laporan" (default: `/dashboard-siswa/laporan-evaluasi/${weekId}/isi`) */
  addHref?: string;
};

export default function DetailHeader({
  weekNumber,
  isDone,
  weekId,
  showBack = true,
  backHref = "/dashboard-siswa/laporan-evaluasi",
  showAdd = true,
  addHref,
}: Props) {
  const computedAddHref =
    addHref ?? `/dashboard-siswa/laporan-evaluasi/${weekId}/isi`;

  return (
    <div className="mb-4">
      {/* Back (optional) */}
      {showBack && (
        <div className="mb-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1]"
          >
            <IoIosArrowRoundBack size={25} />
            <span className="text-xl font-semibold">Kembali</span>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 ml-1">Detail Minggu {weekNumber}</h3>

        {/* Add button (optional) */}
        {showAdd ? (
          !isDone ? (
            <Link
              href={computedAddHref}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-[#0F67B1] text-[#0F67B1] hover:bg-blue-50"
            >
              <span className="text-base">＋</span>
              <span>Isi Laporan</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed">
              <span className="text-base">＋</span>
              <span>Isi Laporan</span>
            </span>
          )
        ) : (
          <span /> /* placeholder agar spacing tetap rapi */
        )}
      </div>
    </div>
  );
}
