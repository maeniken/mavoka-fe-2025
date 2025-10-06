"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import ToggleTabs from "@/app/components/dashboard/toggleTab";

import TableDraftLowongan from "@/app/components/upload-lowongan-pelatihan/TableDraftLowongan";
import TableLowonganTerpasang from "@/app/components/upload-lowongan-pelatihan/TableLowonganTerpasang";

const tabs = [
  { text: "Draft", value: "draft" },
  { text: "Lowongan Terpasang", value: "terpasang" },
] as const;

type TabType = (typeof tabs)[number]["value"];

export default function UploadLowonganInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const actor = localStorage.getItem("actor");
    const token =
      localStorage.getItem("access_token_perusahaan") ||
      localStorage.getItem("access_token");
    console.log("👤 actor:", actor);
    console.log("🔑 token_perusahaan:", token ? token.slice(0, 20) + "..." : null);
  }, []);

  const currentTab: TabType = useMemo(() => {
    const q = (searchParams.get("tab") || "draft").toLowerCase();
    return q === "terpasang" ? "terpasang" : "draft";
  }, [searchParams]);

  const handleChange = (next: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h3 className="mb-5">Lowongan Perusahaan</h3>

{/* HEADER: tabs kiri + tombol kanan (tanpa scroll, kompak di mobile) */}
<div className="flex items-start justify-between gap-2 sm:gap-3">
  {/* Tabs: ikut kecilkan font di mobile agar muat */}
  <div className="flex-1 min-w-0 h-10 flex items-center text-[13px] sm:text-base">
    <ToggleTabs<TabType> tabs={tabs} value={currentTab} onChange={handleChange} />
  </div>

  {/* Tombol: + kiri, 'Lowongan' atas, 'Baru' bawah; kompak di mobile */}
  <Link
    href="/upload-lowongan/lowongan-baru"
    className="
      shrink-0
      grid grid-cols-[auto_1fr] grid-rows-[auto_auto] items-center
      gap-x-2 px-3 py-2 sm:px-4 rounded-lg
      bg-[#0F67B1] text-white hover:bg-[#0d5692] transition text-left
      leading-tight
      max-w-[150px] sm:max-w-[220px]  
    "
    aria-label="Tambah lowongan baru"
  >
    <span className="row-span-2 text-lg sm:text-xl leading-none">+</span>
    <span className="text-xs sm:text-sm ">Lowongan</span>
    <span className="text-xs sm:text-sm ">Baru</span>
  </Link>
</div>


      <div className="flex-1 overflow-y-auto p-6 mt-5 bg-white h-full rounded-xl">
        {currentTab === "draft" ? <TableDraftLowongan /> : <TableLowonganTerpasang />}
      </div>
    </div>
  );
}
