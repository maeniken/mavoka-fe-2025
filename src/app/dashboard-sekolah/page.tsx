import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import * as React from "react";
import LineChartCard from "@/app/components/dashboard/sekolah/lineChartCard";
import { sekolahDatasets } from "@/app/components/dashboard/sekolah/dataDummy";

export default function DashboardSekolah() {
  return (
    <DashboardLayout2
      role="sekolah"
    >
      <div className="p-6">
        <LineChartCard datasets={sekolahDatasets} defaultYear={2026} />
      </div>
    </DashboardLayout2>
  );
}
