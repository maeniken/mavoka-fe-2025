//"use client";
//import { useRouter, usePathname, useSearchParams } from "next/navigation";
//import { useMemo } from "react";
//import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
//import ToggleTabs from "@/app/components/dashboard/toggleTab";

//import DataDiriPage from "../pengaturan/page"; 
//import DataSiswaPage from "../pengaturan/akun/page"; // Contoh komponen Data Siswa
//import AkunSiswaPage from "../pengaturan/sekolah/page"; // Contoh komponen Akun Siswa

//const tabs = [
//  { text: "Data Diri", value: "data" },
//  { text: "Akun", value: "akun" },
//  { text: "Sekolah", value: "sekolah" },
//] as const;

//type TabType = (typeof tabs)[number]["value"];

//export default function PengaturanLayoutInner() {
//  const router = useRouter();
//  const pathname = usePathname();
//  const searchParams = useSearchParams();

//  const currentTab: TabType = useMemo(() => {
//    const q = (searchParams.get("tab") || "data").toLowerCase();
//    return q === "akun" ? "akun" : "data";
//  }, [searchParams]);

//  const handleChange = (next: TabType) => {
//    const params = new URLSearchParams(searchParams.toString());
//    params.set("tab", next);
//    router.push(`${pathname}?${params.toString()}`);  // Menggunakan router.push untuk navigasi
//  };

//  return (
//    <DashboardLayout2 role="siswa">
//      <div className="flex flex-col h-full p-4">
//        <div className="flex shrink-0">
//          <ToggleTabs<TabType>
//            tabs={tabs}
//            value={currentTab}
//            onChange={handleChange}
//          />
//        </div>

//        <div className="flex-1 overflow-y-auto mt-5 h-full">
//          {currentTab === "data" ? <DataSiswaPage /> : currentTab === "akun" ? <AkunSiswaPage /> : null}
//        </div>
//      </div>
//    </DashboardLayout2>
//  );
//}
