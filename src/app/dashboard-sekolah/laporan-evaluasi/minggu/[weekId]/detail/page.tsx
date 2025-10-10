"use client";

import { useParams } from "next/navigation";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import WeekDetailSection from "@/app/components/dashboard/sekolah/laporan-evaluasi/WeekDetailSection";

export default function Page() {
  const { weekId } = useParams() as { weekId: string };
  return (
    <DashboardLayout2>
      <WeekDetailSection weekId={weekId} />
    </DashboardLayout2>
  );
}
