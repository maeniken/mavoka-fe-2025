"use client";

import { Suspense } from "react";
import PengaturanLayoutInner from "./PengaturanLayoutInner";

export default function PengaturanLayout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PengaturanLayoutInner />
    </Suspense>
  );
}
