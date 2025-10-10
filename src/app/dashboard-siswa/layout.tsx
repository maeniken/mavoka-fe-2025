import { Suspense } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout2 role="siswa">
      <Suspense fallback={<div className="p-5">Memuat…</div>}>
        {children}
      </Suspense>
    </DashboardLayout2>
  );
}
