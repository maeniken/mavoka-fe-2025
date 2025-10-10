"use client";

import { useEffect, useMemo, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import GradesTable, {
  GradeAspect as StudentGradeAspect,
} from "@/app/components/dashboard/siswa/laporan-evaluasi/GradesTable";
// ↑ Komponen milik dashboard siswa yang kamu pakai sebelumnya

import {
  getWeekHeader,
  getWeeklyGrades,
} from "@/services/evaluasiSchool-mock"; // facade ke mock/api

export default function WeekGradesSection({ weekId }: { weekId: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  // State yang akan diberikan ke GradesTable (shape versi siswa)
  const [aspects, setAspects] = useState<StudentGradeAspect[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([getWeekHeader(weekId), getWeeklyGrades(weekId)]).then(
      ([h, grades]) => {
        if (!mounted) return;

        // Set header untuk HeaderBar
        setHeader({
          position: h.position,
          company: h.company,
          periodStart: h.periodStart,
          periodEnd: h.periodEnd,
        });

        // Map dari mock sekolah → shape komponen GradesTable (dashboard siswa)
        // mock: { aspect: string, criteria: string[], score: number }
        // siswa: { id: number, name: string, criteria?: string (dipisah \n), score?: number }
        const mapped: StudentGradeAspect[] = grades.map((g, idx) => ({
          id: idx + 1,
          name: g.aspect,
          criteria: (g.criteria ?? []).join("\n"),
          score: g.score,
        }));

        setAspects(mapped);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
    };
  }, [weekId]);

  // Loading state untuk tabel — sama seperti pola di proyekmu
  const isEmpty = useMemo(() => !loading && aspects.length === 0, [loading, aspects]);

  return (
    <div className="p-4">
      {/* Button Kembali */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 mb-4 -mt-2 -ml-4 text-gray-800 hover:text-[#0F67B1] shadow-none"
      >
        <IoIosArrowRoundBack size={25} />
        <span className="text-xl font-semibold">Kembali</span>
      </button>

      {/* Konten Nilai — pakai GradesTable versi siswa */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          Memuat nilai…
        </div>
      ) : (
        <>
          <GradesTable aspects={aspects} />
          {/* Komponen GradesTable milik siswa sudah punya ring & row 'Rata-Rata' bawaan,
              jadi tidak perlu wrapper tambahan agar tampilannya identik. */}
          {isEmpty && (
            <div className="mt-3 text-center text-gray-500">
              Belum ada penilaian untuk minggu ini.
            </div>
          )}
        </>
      )}
    </div>
  );
}
