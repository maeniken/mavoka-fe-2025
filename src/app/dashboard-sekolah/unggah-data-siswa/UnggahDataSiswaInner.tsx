"use client";

import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import ToggleTabs from "@/app/components/dashboard/toggleTab";
import UploadExcel from "@/app/components/dashboard/sekolah/unggah-data/uploadExcel";
import UploadManual from "@/app/components/dashboard/sekolah/unggah-data/uploadManual";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const tabs = [
  { text: "Dengan File", value: "excel" },
  { text: "Manual", value: "manual" },
] as const;

type Mode = (typeof tabs)[number]["value"];

export default function UnggahDataSiswaInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ambil mode dari query param
  const mode: Mode = useMemo(() => {
    const q = (searchParams.get("tab") || "excel").toLowerCase();
    return q === "manual" ? "manual" : "excel";
  }, [searchParams]);

  // Update URL saat tab berubah (tanpa reload & tanpa scroll)
  const handleChange = (next: Mode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <DashboardLayout2 role="sekolah">
      <div className="flex h-full min-h-0 flex-col p-6">
        {/* Tabs */}
        <div className="mb-6 shrink-0">
          <ToggleTabs<Mode> tabs={tabs} value={mode} onChange={handleChange} />
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-xl bg-[#FFFFFF] shadow-sm">
            <div className="p-6">
              {mode === "excel" ? <UploadExcel /> : <UploadManual />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout2>
  );
}
