//"use client";

//import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
//import { useMemo, useState } from "react";
//import FilterBar from "@/app/components/dashboard/perusahaan/monitoring/FilterBar";
//import GenerateCertificateButton from "@/app/components/dashboard/perusahaan/monitoring/GenerateCertificateButton";
//import MonitoringTable, { MonitoringRow } from "@/app/components/dashboard/perusahaan/monitoring/MonitoringTable";
//import Pagination from "@/app/components/dashboard/Pagination";

///** helper format tanggal Indonesia */
//function formatID(date: string | Date) {
//  const d = typeof date === "string" ? new Date(date) : date;
//  return new Intl.DateTimeFormat("id-ID", {
//    day: "numeric",
//    month: "long",
//    year: "numeric",
//  }).format(d);
//}

///** tipe periode */
//type Period = {
//  id: string;
//  start: string; // YYYY-MM-DD
//  end: string;   // YYYY-MM-DD
//  label?: string;
//};

///** dropdown Periode */
//function PeriodSelect({
//  periods,
//  selectedId,
//  onChange,
//}: {
//  periods: Period[];
//  selectedId: string;
//  onChange: (id: string) => void;
//}) {
//  return (
//    <div className="flex items-center gap-2">
//      <span className="text-sm text-gray-700">Periode</span>
//      <select
//        value={selectedId}
//        onChange={(e) => onChange(e.target.value)}
//        className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-[#0F67B1]"
//      >
//        {periods.map((p) => (
//          <option key={p.id} value={p.id}>
//            {p.label ?? `${formatID(p.start)} - ${formatID(p.end)}`}
//          </option>
//        ))}
//      </select>
//    </div>
//  );
//}

//export default function MonitoringPage() {
//  const [page, setPage] = useState(1);
//  const [perPage, setPerPage] = useState(10);
//  const [selectedPosisi, setSelectedPosisi] = useState<string>("");

//  // ====== DATA FILTER ======
//  const positions = ["Administrasi Perkantoran", "Desain Grafis", "IT Support"];

//  const periods: Period[] = [
//    { id: "2026-07", start: "2026-07-01", end: "2026-08-31" },
//    { id: "2026-09", start: "2026-09-01", end: "2026-10-31" },
//    { id: "2026-11", start: "2026-11-01", end: "2026-12-31" },
//  ];
//  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(periods[0].id);

//  const currentPeriod = useMemo(
//    () => periods.find((p) => p.id === selectedPeriodId) ?? periods[0],
//    [periods, selectedPeriodId]
//  );
//  const currentPeriodLabel =
//    currentPeriod.label ?? `${formatID(currentPeriod.start)} - ${formatID(currentPeriod.end)}`;

//  // ====== DATA TABEL (dummy) ======
//  const data: MonitoringRow[] = [
//    {
//      id: 1,
//      nama: "Lisa Mariana",
//      posisi: "Administrasi Perkantoran",
//      pelatihan: "Dasar",
//      nilaiPelatihan: 72,
//      nilaiAkhir: 80,
//      laporanId: "lap1",
//    },
//    {
//      id: 2,
//      nama: "Andi Saputra",
//      posisi: "Desain Grafis",
//      pelatihan: "Intermediate",
//      nilaiPelatihan: 85,
//      nilaiAkhir: 88,
//      laporanId: "lap2",
//    },
//    {
//      id: 3,
//      nama: "Budi Santoso",
//      posisi: "IT Support",
//      pelatihan: "Networking",
//      nilaiPelatihan: 78,
//      nilaiAkhir: 82,
//      laporanId: "lap3",
//    },
//  ];

//  // ====== FILTERING ======
//  const filteredByPosisi = selectedPosisi
//    ? data.filter((d) => d.posisi === selectedPosisi)
//    : data;

//  const filteredData = filteredByPosisi;

//  // ====== PAGINATION ======
//  const totalPages = Math.ceil(filteredData.length / perPage) || 1;
//  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage);

//  // ✅ SUNTIKKAN periode yang dipilih ke setiap row sebelum dikirim ke table
//  const rowsWithPeriod: MonitoringRow[] = paginatedData.map((row) => ({
//    ...row,
//    periodStart: currentPeriod.start,
//    periodEnd: currentPeriod.end,
//    // atau kalau mau satu string langsung:
//    // periode: currentPeriodLabel,
//  }));

//  return (
//    <DashboardLayout2>
//      <div className="p-5">
//        <h3 className="font-bold mb-4">Monitoring Pemagangan</h3>

//        <div className="bg-white p-4 rounded-md shadow-sm">
//          {/* Filter + Button */}
//          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
//            <div className="flex flex-wrap items-center gap-3">
//              <FilterBar
//                positions={positions}
//                selected={selectedPosisi}
//                onChange={(v) => {
//                  setSelectedPosisi(v);
//                  setPage(1);
//                }}
//              />
//              <PeriodSelect
//                periods={periods}
//                selectedId={selectedPeriodId}
//                onChange={(id) => {
//                  setSelectedPeriodId(id);
//                  setPage(1);
//                }}
//              />
//            </div>

//            <GenerateCertificateButton onClick={() => alert("Generate sertifikat")} />
//          </div>

//          {/* Label periode di atas tabel */}
//          <div className="text-center text-sm text-gray-800 font-semibold mb-2">
//            Periode {currentPeriodLabel}
//          </div>

//          {/* Table */}
//          {/* ✅ kirim rows yang sudah mengandung periode */}
//          <MonitoringTable data={rowsWithPeriod} />

//          {/* Pagination */}
//          <Pagination
//            page={page}
//            totalPages={totalPages}
//            onPageChange={setPage}
//            perPage={perPage}
//            onPerPageChange={setPerPage}
//          />
//        </div>
//      </div>
//    </DashboardLayout2>
//  );
//}

import { Suspense } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import Content from "./monitoringInner";

export default function MonitoringPage() {
  return (
    <Suspense fallback={<div className="p-5">Memuat monitoring…</div>}>
      <DashboardLayout2>
        <Content />
      </DashboardLayout2>
    </Suspense>
  );
}
