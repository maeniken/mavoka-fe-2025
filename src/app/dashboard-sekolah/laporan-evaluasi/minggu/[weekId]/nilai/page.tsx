"use client";

import { useParams } from "next/navigation";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import WeekGradesSection from "@/app/components/dashboard/sekolah/laporan-evaluasi/WeekGradesSection";

export default function Page() {
  const { weekId } = useParams() as { weekId: string };
  return (
    <DashboardLayout2>
      <WeekGradesSection weekId={weekId} />
    </DashboardLayout2>
  );
}
