"use client";

import { Suspense } from "react";
import PelamarListInner from "./PelamarListInner";

export default function PelamarListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PelamarListInner />
    </Suspense>
  );
}
