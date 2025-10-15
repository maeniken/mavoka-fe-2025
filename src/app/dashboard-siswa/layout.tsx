import { Suspense } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-5">Memuat…</div>}>
      <DashboardLayout2 role="siswa">{children}</DashboardLayout2>
    </Suspense>
  );
}
