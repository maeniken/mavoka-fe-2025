"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import SchoolEvalFilterBar from "@/app/components/dashboard/sekolah/laporan-evaluasi/SchoolEvalFilterBar";
import SchoolStudentsEvalTable from "@/app/components/dashboard/sekolah/laporan-evaluasi/SchoolStudentsEvalTable";
import Pagination from "@/app/components/dashboard/Pagination";
import { getStudents } from "@/services/evaluasiSchool-mock"; // facade (mock/api)

const MAJOR_OPTIONS = [
  {
    label: "Otomatisasi Dan Tata Kelola Perkantoran",
    value: "Otomatisasi Dan Tata Kelola Perkantoran",
  },
  { label: "Rekayasa Perangkat Lunak", value: "Rekayasa Perangkat Lunak" },
  { label: "Teknik Komputer & Jaringan", value: "Teknik Komputer & Jaringan" },
  { label: "Akuntansi", value: "Akuntansi" },
];

const PERIOD_OPTIONS = [
  { label: "1 Juli 2026 – 31 Agustus 2026", value: "2026-07_2026-08" },
  { label: "1 Sept 2026 – 31 Okt 2026", value: "2026-09_2026-10" },
];

export default function Page() {
  const [major, setMajor] = useState<string | undefined>();
  const [period, setPeriod] = useState<string | undefined>();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const periodLabel = useMemo(() => {
    const found = PERIOD_OPTIONS.find((p) => p.value === period);
    return found?.label ?? "1 Juli 2026 – 31 Agustus 2026";
  }, [period]);

  useEffect(() => {
    setLoading(true);
    getStudents({ major, period: periodLabel, page, perPage }).then((res) => {
      setRows(res.rows);
      setTotal(res.total);
      setLoading(false);
    });
  }, [major, periodLabel, page, perPage]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <DashboardLayout2>
      <div className="p-4">
        <h3 className=" text-gray-900 mb-5">
          Laporan Evaluasi Pemagangan Siswa
        </h3>

        {/* Satu card putih menampung filter + tabel + pagination */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SchoolEvalFilterBar
            majors={MAJOR_OPTIONS}
            periods={PERIOD_OPTIONS}
            selectedMajor={major}
            selectedPeriod={period}
            onChange={({ major: m, period: p }) => {
              setMajor(m);
              setPeriod(p);
              setPage(1); // reset pagination saat filter berubah
            }}
            embedded
          />

          {loading ? (
            <div className="p-10 text-center text-gray-500">Memuat data…</div>
          ) : (
            <>
              <div className="mt-3">
                <SchoolStudentsEvalTable rows={rows} page={page} perPage={perPage} />
              </div>
              
              <div className="mt-3">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                  perPage={perPage}
                  onPerPageChange={(n) => {
                    setPerPage(n);
                    setPage(1);
                  }}
                  perPageOptions={[10, 20, 30, 50]}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout2>
  );
}
