import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import * as React from "react";
import DashboardTopCard from "@/app/components/dashboard/lpk/DashboardTopCard";
import ProgressPelatihan from "@/app/components/dashboard/lpk/ProgressPelatihan";
import { Suspense } from "react";

export default function DashboardLpk() {
  const stats = [
    { title: "Perusahaan", value: 25, label: "Perusahaan Mitra" },
    { title: "Siswa Aktif", value: 42, label: "Siswa aktif melaksanakan pelatihan" },
    { title: "Pelatihan Aktif", value: 12, label: "Bidang kelas pelatihan" },
  ];

  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
    <DashboardLayout2
      role="lpk"
    >
      {/* Grid pindah ke page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <DashboardTopCard key={index} stat={stat} />
        ))}
      </div>

      <ProgressPelatihan />
    </DashboardLayout2>
    </Suspense>
  );
}
