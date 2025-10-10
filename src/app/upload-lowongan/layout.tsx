//"use client";

import React from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

export default function Layout({ children }: { children: React.ReactNode }) {
  // PENTING: children dirender di sini
  return <DashboardLayout2 role="perusahaan">{children}</DashboardLayout2>;
}
