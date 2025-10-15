"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentDetailTable from "@/app/components/dashboard/sekolah/data-siswa/StudentDetailTable";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import { IoIosArrowRoundBack } from "react-icons/io";
import { fetchLamaranBySiswaId } from "@/services/sekolah-students";
import type { ApplicationStatus, StudentApplicationDetail } from "@/types/unggah-data-siswa";

function DetailSkeleton() {
  return (
    <div className="bg-white rounded-md p-4">
      <div className="h-5 w-40 mb-4 bg-gray-200/80 animate-pulse rounded" />
      <div className="h-28 w-full bg-gray-200/80 animate-pulse rounded" />
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id;
  const numericId = useMemo(() => {
    const s = Array.isArray(idParam) ? idParam[0] : idParam;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }, [idParam]);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StudentApplicationDetail[]>([]);

  useEffect(() => {
    if (!numericId) return;
    (async () => {
      try {
        setLoading(true);
        const item = await fetchLamaranBySiswaId(numericId);
        if (!item) {
          setRows([]);
          return;
        }
        const nama = item.nama_lengkap || "-";
        const jur = item.jurusan || "-";
        // Map lamaran → rows for the detail table
        const sorted = [...(item.lamaran || [])].sort((a: any, b: any) => {
          const ta = a?.tanggal_lamaran ? new Date(a.tanggal_lamaran).getTime() : 0;
          const tb = b?.tanggal_lamaran ? new Date(b.tanggal_lamaran).getTime() : 0;
          return tb - ta;
        });
        const mapped: StudentApplicationDetail[] = sorted.map((l: any, idx: number) => {
          const statRaw = String(l.status_lamaran || '').toLowerCase();
          const statusMap: Record<string, ApplicationStatus> = {
            lamar: 'Lamar',
            wawancara: 'Wawancara',
            penawaran: 'Penawaran',
            diterima: 'Diterima',
            ditolak: 'Ditolak',
          };
          const status: ApplicationStatus = statusMap[statRaw] ?? 'Lamar';
          return {
            id: idx + 1,
            namaSiswa: nama,
            jurusan: jur,
            tahunAjaran: '-', // add when available from backend per-lamaran or from siswa record
            perusahaan: (l as any).nama_perusahaan || '-',
            divisiPenempatan: (l as any).posisi || '-',
            status,
          };
        });
        setRows(mapped);
      } catch (e) {
        console.error('[detail siswa] load fail', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [numericId]);

  if (!numericId) {
    // invalid id, go back to list
    if (typeof window !== 'undefined') router.replace('/dashboard-sekolah/data-siswa');
    return null;
  }

  return (
    <DashboardLayout2>
      <div className="p-4 -mt-1">
        <Link
          href="/dashboard-sekolah/data-siswa"
          className="-ml-1 mb-2 inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none"
        >
          <IoIosArrowRoundBack size={25} />
          <span className="text-xl font-semibold">Kembali</span>
        </Link>

        <h3 className="mb-4">Detail Data Siswa</h3>

        <div className="bg-white rounded-md p-4">
          <StudentDetailTable rows={rows} loading={loading} noCardWrapper />
        </div>
      </div>
    </DashboardLayout2>
  );
}
