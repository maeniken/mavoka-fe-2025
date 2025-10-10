//// File: C:\laragon\www\magang\mavoka\mavoka-fe-2025\src\app\dashboard-sekolah\data-siswa\[id]\page.tsx
//import Link from "next/link";
//import StudentDetailTable from "@/app/components/dashboard/sekolah/data-siswa/StudentDetailTable";
//import { StudentApplicationDetail } from "@/types/unggah-data-siswa";
//import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
//import { IoIosArrowRoundBack } from "react-icons/io";

//// Menentukan tipe untuk params
//export interface PageProps {
//  params: { id: string }; // params sekarang adalah objek biasa, bukan Promise
//  searchParams?: any;
//}

//export default function StudentDetailPage({
//  params,
//}: {
//  params: { id: string };
//}) {
//  const rows: StudentApplicationDetail[] = [
//    {
//      id: 1,
//      namaSiswa: "Lisa Mariana",
//      jurusan: "Administrasi Perkantoran",
//      tahunAjaran: "2025/2026",
//      perusahaan: "Bank Mandiri KC Yogyakarta",
//      divisiPenempatan: "Administrasi Perkantoran",
//      status: "Interview",
//    },
//    {
//      id: 2,
//      namaSiswa: "Lisa Mariana",
//      jurusan: "Administrasi Perkantoran",
//      tahunAjaran: "2025/2026",
//      perusahaan: "Kantor Notaris & PPAT Yogyakarta",
//      divisiPenempatan: "Administrasi & Pengarsipan",
//      status: "Ditolak",
//    },
//  ];

//  return (
//    <DashboardLayout2>
//      <div className="p-4 -mt-1">
//        <Link
//          href="/dashboard-sekolah/data-siswa"
//          className="-ml-5 mb-2 inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none"
//        >
//          <IoIosArrowRoundBack size={25} />
//          <span className="text-xl font-semibold">Kembali</span>
//        </Link>
//        <h3 className="mb-4">Detail Data Siswa</h3>
//        <div className="bg-white rounded-md p-4">
//          <StudentDetailTable rows={rows} noCardWrapper />
//        </div>
//      </div>
//    </DashboardLayout2>
//  );
//}

import Link from "next/link";
import { notFound } from "next/navigation";
import StudentDetailTable from "@/app/components/dashboard/sekolah/data-siswa/StudentDetailTable";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import { IoIosArrowRoundBack } from "react-icons/io";

import { getStudentDetailById } from "@/app/data/dummyStudents";

// ✅ Sesuaikan ekspektasi Next 15: params sebagai Promise & fungsi async
type Params = { id: string };

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const detail = getStudentDetailById(numericId);
  if (!detail) notFound();

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
          {/* Komponen detail kamu menerima rows[] */}
          <StudentDetailTable
            rows={[
              {
                id: detail.id,
                namaSiswa: detail.namaSiswa,
                jurusan: detail.jurusan,
                tahunAjaran: detail.tahunAjaran,
                perusahaan: detail.perusahaan,
                divisiPenempatan: detail.divisiPenempatan,
                status: detail.status,
              },
            ]}
            noCardWrapper
          />
        </div>
      </div>
    </DashboardLayout2>
  );
}
