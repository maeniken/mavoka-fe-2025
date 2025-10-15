import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import * as React from "react";
import LineChartCard from "@/app/components/dashboard/sekolah/lineChartCard";
import { sekolahDatasets } from "@/app/components/dashboard/sekolah/dataDummy";
import { Suspense } from "react";

export default function DashboardSekolah() {
  return (
    <Suspense fallback={<div className="p-5">Memuat data…</div>}>
    <DashboardLayout2
      role="sekolah"
    >
      <div className="p-6">
        <LineChartCard datasets={sekolahDatasets} defaultYear={2026} />
      </div>
    </DashboardLayout2>
    </Suspense>
  );
}
