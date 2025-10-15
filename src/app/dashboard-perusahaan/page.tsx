import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import * as React from "react";
import DashboardTopCard from "@/app/components/dashboard/perusahaan/DashboardTopCard";
import LowonganTerpasang from "@/app/components/dashboard/perusahaan/LowonganTerpasang";
import LembagaPelatihan from "@/app/components/dashboard/perusahaan/LembagaPelatihan";
import { Suspense } from "react";

export default function DashboardPerusahaan() {
  const stats = [
    { title: "Total Pemagang Aktif", value: 25, label: "Siswa diterima" },
    { title: "Total Pelamar Aktif", value: 255, label: "Siswa mendaftar lowongan" },
    { title: "Total Lowongan", value: 12, label: "Lowongan tersedia" },
  ];

  return (
    <Suspense fallback={<div className="p-5">Memuat data…</div>}>
    <DashboardLayout2
      role="perusahaan"
    >
      {/* Section Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {stats.map((stat, index) => (
          <DashboardTopCard key={index} stat={stat} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center px-6">
        <div className="md:col-span-2 h-full">
          <LowonganTerpasang className="h-full" />
        </div>
        <div className="h-full">
          <LembagaPelatihan className="h-full" />
        </div>
      </div>
    </DashboardLayout2>
    </Suspense>
  );
}
