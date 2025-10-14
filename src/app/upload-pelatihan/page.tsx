"use client";
import TableDraftPelatihan from "@/app/components/upload-lowongan-pelatihan/TableDraftPelatihan";
import { Suspense } from "react";

export default function UploadPelatihanPage() {

  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
      <TableDraftPelatihan/>
    </Suspense>
  );
}
