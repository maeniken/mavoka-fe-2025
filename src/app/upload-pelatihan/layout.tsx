"use client";

import { Suspense } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import UploadPelatihanInner from "./UploadPelatihanInner";

export default function UploadPelatihanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout2 role="lpk">
        <UploadPelatihanInner>{children}</UploadPelatihanInner>
      </DashboardLayout2>
    </Suspense>
  );
}
