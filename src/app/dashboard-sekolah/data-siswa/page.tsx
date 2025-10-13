"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StudentsTable from "@/app/components/dashboard/sekolah/data-siswa/StudentsTable";
import StudentsTableSkeleton from "@/app/components/dashboard/sekolah/data-siswa/StudentsTableSkeleton";
import Pagination from "@/app/components/dashboard/Pagination";
import FilterBar from "@/app/components/dashboard/sekolah/data-siswa/FilterBar";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import { fetchSiswaBySekolah } from "@/services/sekolah-students";
import { getJurusanBySekolah } from "@/services/sekolah";
import { resolveRoleId } from "@/lib/auth-storage";

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

  // options from backend
  const [jurusanOptions, setJurusanOptions] = useState<string[]>([]);
  const [tahunOptions] = useState<string[]>(["2024/2025", "2025/2026"]); // TODO: fetch distinct from API if available

  // server data
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const start = (page - 1) * perPage;

  const sekolahId = resolveRoleId('sekolah');

  useEffect(() => {
    // fetch jurusan list for this school
    (async () => {
      try {
        if (!sekolahId) return;
        const j = await getJurusanBySekolah(sekolahId);
        setJurusanOptions(Array.isArray(j) ? j.map(x => x.nama_jurusan) : []);
      } catch (e) { console.warn('[data-siswa] jurusan fetch fail', e); }
    })();
  }, [sekolahId]);

  useEffect(() => {
    // fetch siswa based on filters/pagination
    (async () => {
      try {
        setLoading(true);
        const resp = await fetchSiswaBySekolah({
          jurusan: jurusan || undefined,
          tahun: tahun || undefined,
          status,
          page,
          perPage,
        });
        setRows(resp.data ?? []);
        const last = resp.pagination?.last_page ?? 1;
        setTotalPages(Math.max(1, Number(last)));
      } catch (e) {
        console.error('[data-siswa] load fail', e);
        setRows([]);
        setTotalPages(1);
      } finally { setLoading(false); }
    })();
  }, [jurusan, tahun, status, page, perPage]);

  const paged = rows; // backend already paginated

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
          {loading ? (
            <StudentsTableSkeleton />
          ) : (
            <StudentsTable
              rows={paged}
              rowNumberOffset={start}
              onDetail={(id) => router.push(`/dashboard-sekolah/data-siswa/${id}`)}
              noCardWrapper
            />
          )}
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
