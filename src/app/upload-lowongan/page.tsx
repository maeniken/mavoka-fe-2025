//import UploadLowonganLayout from "../upload-lowongan/layout";

//export default function UploadLowonganPage() {
//  return <UploadLowonganLayout view="list" />;
//}
"use client";

import { Suspense } from "react";
import UploadLowonganInner from "./UploadLowonganInner";

export default function PageUploadLowongan() {
  return (
    <Suspense fallback={<p className="p-6 text-center">Loading lowongan...</p>}>
      <UploadLowonganInner />
    </Suspense>
  );
}
