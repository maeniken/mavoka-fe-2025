import DashboardLayout from "@/app/components/dashboard/layout";
import LaporanUmum from "@/app/components/admin/LaporanUmum";
import { Suspense } from "react";

export default function LaporanUmumPage() {
  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
    <DashboardLayout>
      <div className="ml-5 mt-2 mr-5">
        <h1 className="font-bold text-[#0F67B1]">SELAMAT DATANG</h1>
        <p className="text-[#A3A3A3] mb-10">
          Hi, Minvo. Selamat datang kembali di MAVOKA Admin Dashboard!
        </p>
        <LaporanUmum />
      </div>
    </DashboardLayout>
    </Suspense>
  );
}
