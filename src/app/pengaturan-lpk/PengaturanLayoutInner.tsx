"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import ToggleTabs from "@/app/components/dashboard/toggleTab";

import DataLpkPage from "@/app/pengaturan-lpk/page";
import AkunLpkPage from "@/app/pengaturan-lpk/akun-lpk/page";

const tabs = [
  { text: "Data Lembaga", value: "data" },
  { text: "Akun Lembaga", value: "akun" },
] as const;

type TabType = (typeof tabs)[number]["value"];

export default function PengaturanLayoutInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    <DashboardLayout2 role="lpk">
      <div className="flex flex-col h-full p-4">
        <div className="flex shrink-0">
          <ToggleTabs<TabType>
            tabs={tabs}
            value={currentTab}
            onChange={handleChange}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-5 h-full">
          {currentTab === "data" ? <DataLpkPage /> : <AkunLpkPage />}
        </div>
      </div>
    </DashboardLayout2>
  );
}
