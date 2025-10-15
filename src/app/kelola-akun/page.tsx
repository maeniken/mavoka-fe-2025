import DashboardLayout from "@/app/components/dashboard/layout";
import StatusVerifikasiTable from "@/app/components/admin/StatusVerifikasiTable";
import { Suspense } from "react";

export default function DashboardAdmin() {
  return (
    <Suspense fallback={<div className="p-5">Memuat data…</div>}>
    <DashboardLayout >
      <div className="ml-5 mt-2 mr-5">
        <h1 className="font-bold text-[#0F67B1]">SELAMAT DATANG</h1>
        <p className="text-[#A3A3A3] mb-10">
          Hi, Minvo. Selamat datang kembali di MAVOKA Admin Dashboard!
        </p>
      <h3 className="font-semibold mb-4">Status Verifikasi Akun User</h3>
        <StatusVerifikasiTable />
      </div>
    </DashboardLayout>
    </Suspense>
  );
}
