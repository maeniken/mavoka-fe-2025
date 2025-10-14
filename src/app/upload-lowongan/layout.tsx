//"use client";

import React from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  // PENTING: children dirender di sini
  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
      <DashboardLayout2 role="perusahaan">{children}</DashboardLayout2>
    </Suspense>
  );
}
