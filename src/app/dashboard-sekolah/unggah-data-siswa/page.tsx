"use client";

import { Suspense } from "react";
import UnggahDataSiswaInner from "./UnggahDataSiswaInner";

export default function UnggahDataSiswa() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnggahDataSiswaInner />
    </Suspense>
  );
}
