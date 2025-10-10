"use client";
import { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StudentsTable from "@/app/components/dashboard/sekolah/data-siswa/StudentsTable";
import Pagination from "@/app/components/dashboard/Pagination";
import FilterBar from "@/app/components/dashboard/sekolah/data-siswa/FilterBar";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import { getStudentList } from "@/app/data/dummyStudents";

// 👉 Pisahkan konten yang pakai hook ke komponen Content, lalu bungkus dengan Suspense
function DataSiswaContent() {
  const router = useRouter();

  // filter
  const [jurusan, setJurusan] = useState<string>("");
  const [status, setStatus] = useState<"Semua" | "Aktif" | "Tidak">("Semua");
  const [tahun, setTahun] = useState<string>("2025/2026");

  // pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // options (dummy)
  const jurusanOptions = ["Administrasi Perkantoran", "Desain Grafis"];
  const tahunOptions = ["2024/2025", "2025/2026"];

  // data dummy shared
  const allRows = getStudentList();

  // filter
  const filtered = allRows.filter((r) => {
    const okJ = jurusan ? r.jurusan === jurusan : true;
    const okT = tahun ? r.tahunAjaran === tahun : true;
    const okS = status === "Semua" ? true : r.statusAkun === status;
    return okJ && okT && okS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const paged = useMemo(() => filtered.slice(start, start + perPage), [filtered, start, perPage]);

  const resetToFirstPage = () => setPage(1);

  return (
    <div className="p-5">
      <h3 className="mb-3">Data Siswa</h3>

      <div className="bg-white rounded-md p-5">
        <FilterBar
          jurusanOptions={jurusanOptions}
          tahunOptions={tahunOptions}
          statusOptions={["Semua", "Aktif", "Tidak"]}
          selectedJurusan={jurusan}
          selectedTahun={tahun}
          selectedStatus={status}
          onChangeJurusan={(v) => { setJurusan(v); resetToFirstPage(); }}
          onChangeTahun={(v) => { setTahun(v); resetToFirstPage(); }}
          onChangeStatus={(v) => { setStatus(v as any); resetToFirstPage(); }}
        />

        <div className="mt-4">
          <StudentsTable
            rows={paged}
            rowNumberOffset={start}
            onDetail={(id) => router.push(`/dashboard-sekolah/data-siswa/${id}`)}
            noCardWrapper
          />
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(n) => { setPerPage(n); resetToFirstPage(); }}
          perPageOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}

export default function DataSiswaPage() {
  return (
    <DashboardLayout2>
      {/* ✅ Suspense wajib untuk hook routing seperti useSearchParams di anak-anaknya */}
      <Suspense fallback={<div className="p-5">Memuat data…</div>}>
        <DataSiswaContent />
      </Suspense>
    </DashboardLayout2>
  );
}
