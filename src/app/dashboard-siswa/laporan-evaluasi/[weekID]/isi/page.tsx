"use client";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ReportForm from "@/app/components/dashboard/siswa/laporan-evaluasi/ReportForm";
import { useReport } from "@/app/components/dashboard/siswa/laporan-evaluasi/reportProvider";
import { IoIosArrowRoundBack } from "react-icons/io";

export default function IsiLaporanPage() {
  const router = useRouter();
  const { weekID } = useParams<{ weekID: string }>();
  const { state, addLog } = useReport() as any;
  const [loading, setLoading] = useState(false);

  const week = useMemo(
    () => state.weeks.find((w: any) => w.id === weekID),
    [state.weeks, weekID]
  );

  if (!week) {
    return (
      <div className="px-4 md:px-6 py-4">
        <button onClick={() => router.back()} className="text-black  shadow-none cursor-pointer">← Kembali</button>
        <p className="mt-3 text-gray-700">Minggu tidak ditemukan.</p>
      </div>
    );
  }


  const handleSubmit = async (f: {
    date: string; activity: string; output: string; obstacle: string; solution: string; photoFile?: File | null;
  }) => {
    if (!f.date || !f.activity) {
      alert("Tanggal dan Deskripsi Kegiatan wajib diisi.");
      return;
    }
    if (f.photoFile && !/image\/(jpeg|png)/.test(f.photoFile.type)) {
      alert("Format foto harus .jpg atau .png");
      return;
    }

    setLoading(true);
    try {
      const photoUrl = f.photoFile ? URL.createObjectURL(f.photoFile) : undefined;

      await addLog(week.id, {
        date: f.date,
        activity: f.activity,
        output: f.output,
        obstacle: f.obstacle,
        solution: f.solution,
        photoUrl,
      });

      router.push(`/dashboard-siswa/laporan-evaluasi/${week.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 ">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none">
          <IoIosArrowRoundBack size={25} />
          <span className="text-xl font-semibold">Kembali</span>
      </button>
      <ReportForm weekNumber={week.number} onSubmit={handleSubmit} submitting={loading} />
    </div>
  );
}
