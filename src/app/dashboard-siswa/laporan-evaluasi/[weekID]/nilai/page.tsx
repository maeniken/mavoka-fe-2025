"use client";
import Link from "next/link";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useReport } from "@/app/components/dashboard/siswa/laporan-evaluasi/reportProvider";
import GradesTable, { GradeAspect } from "@/app/components/dashboard/siswa/laporan-evaluasi/GradesTable";

const DEFAULT_ASPECTS: GradeAspect[] = [
  { id: 1, name: "Aspek Teknis" },
  { id: 2, name: "Aspek Komunikasi" },
  { id: 3, name: "Aspek Kerjasama" },
  { id: 4, name: "Aspek Disiplin" },
  { id: 5, name: "Aspek Inisiatif" },
];

export default function WeekGradePage() {
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
        <button
          onClick={() => router.push("/dashboard-siswa/laporan-evaluasi")}
          className="text-[#0F67B1] hover:underline"
        >
          ← Kembali
        </button>
        <p className="mt-3 text-gray-700">Minggu tidak ditemukan.</p>
      </div>
    );
  }

  // Ambil data nilai/kriteria jika ada, jika belum tampilkan "-"
  const aspects: GradeAspect[] = DEFAULT_ASPECTS.map((a) => {
    const filled = week.companyGrades?.find(
      (g: any) => g.name === a.name || g.id === a.id
    );
    return {
      ...a,
      criteria: filled?.criteria,
      score: typeof filled?.score === "number" ? filled.score : undefined,
    };
  });

  return (
    <div className="p-3 mt-2">
      <div className="mb-2">
        <Link
          href={`/dashboard-siswa/laporan-evaluasi`}
          className="inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1]"
          aria-label="Kembali"
        >
          <IoIosArrowRoundBack size={25} />
          <span className="text-xl font-semibold">Kembali</span>
        </Link>
      </div>

      <h2 className="text-gray-900 text-xl md:text-2xl font-semibold mb-3">
        Penilaian Aspek Mingguan
      </h2>

      {/* Selalu tampilkan tabel; nilai/criteria yang belum ada akan menjadi "-" */}
      <GradesTable aspects={aspects} />
    </div>
  );
}
