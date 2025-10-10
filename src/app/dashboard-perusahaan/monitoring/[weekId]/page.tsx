import { Suspense } from "react";
import Content from "./weekInner";

export default function WeekDetailCompanyPage() {
  return (
    <Suspense fallback={<div className="p-4">Memuat minggu…</div>}>
      <Content />
    </Suspense>
  );
}
