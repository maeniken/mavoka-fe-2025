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
    <DashboardLayout2 role="lpk">
      <Suspense fallback={<div>Loading...</div>}>
        <UploadPelatihanInner>{children}</UploadPelatihanInner>
      </Suspense>
    </DashboardLayout2>
  );
}
