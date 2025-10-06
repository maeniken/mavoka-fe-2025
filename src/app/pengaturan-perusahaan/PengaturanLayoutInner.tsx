"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import ToggleTabs from "@/app/components/dashboard/toggleTab";

// Import child pages
import DataPerusahaanPage from "@/app/pengaturan-perusahaan/page";
import AkunPerusahaanPage from "@/app/pengaturan-perusahaan/akun-perusahaan/page";

const tabs = [
  { text: "Data Perusahaan", value: "data" },
  { text: "Akun Perusahaan", value: "akun" },
] as const;

type TabType = (typeof tabs)[number]["value"];

export default function PengaturanLayoutInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Ambil tab dari query param, default "data"
  const currentTab: TabType = useMemo(() => {
    const q = (searchParams.get("tab") || "data").toLowerCase();
    return q === "akun" ? "akun" : "data";
  }, [searchParams]);

  const handleChange = (next: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <DashboardLayout2 role="perusahaan">
      <div className="flex flex-col h-full p-6">
        {/* Tabs */}
        <div className="flex shrink-0">
          <ToggleTabs<TabType>
            tabs={tabs}
            value={currentTab}
            onChange={handleChange}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 mt-5 bg-white h-full">
          {currentTab === "data" ? <DataPerusahaanPage /> : <AkunPerusahaanPage />}
        </div>
      </div>
    </DashboardLayout2>
  );
}
