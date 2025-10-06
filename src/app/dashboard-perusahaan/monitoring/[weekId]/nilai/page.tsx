"use client";

import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";
import GradesTableCompany from "@/app/components/dashboard/perusahaan/monitoring/GradesTableCompany";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

export default function Page() {
  const router = useRouter();

  return (
    <DashboardLayout2>
    <div className="p-3">
      {/* Back */}
        <button
          onClick={() => router.back()}
          className="-ml-1 mt-2 mb-2 inline-flex items-center gap-2 text-gray-800 hover:text-[#0F67B1] shadow-none"
        >
          <IoIosArrowRoundBack size={25} />
          <span className="text-xl font-semibold">Kembali</span>
        </button>

      <h3 className="ml-4 text-gray-900 mb-4">
        Penilaian Aspek Mingguan
      </h3>

      <GradesTableCompany
        onSave={(rows, avg) => {
          // TODO: panggil API simpan
          console.log("SIMPAN PENILAIAN", { rows, rataRata: avg });
        }}
      />
    </div>
    </DashboardLayout2>
  );
}
