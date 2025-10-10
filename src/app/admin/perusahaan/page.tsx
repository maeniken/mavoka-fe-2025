"use client";
import PerusahaanTable from '@/app/components/perusahaan/PerusahaanTable';

export default function AdminPerusahaanPage(){
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin - Perusahaan</h1>
      <PerusahaanTable />
    </div>
  );
}
