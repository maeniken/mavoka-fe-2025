"use client";

import { Suspense } from "react";
import InnerPengaturanLayout from "./PengaturanLayoutInner";

export default function PengaturanLayout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerPengaturanLayout />
    </Suspense>
  );
}
