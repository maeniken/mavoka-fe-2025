import { Suspense } from "react";
import Content from "./nilaiAkhirInner";

export default function NilaiAkhirPage() {
  return (
    <Suspense fallback={<div className="px-4 md:px-6">Memuat penilaian…</div>}>
      <Content />
    </Suspense>
  );
}
