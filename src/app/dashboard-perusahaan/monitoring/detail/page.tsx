import { Suspense } from "react";
import Content from "./detailInner";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Memuat detail…</div>}>
      <Content />
    </Suspense>
  );
}
