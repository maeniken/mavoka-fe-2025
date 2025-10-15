"use client";
import Link from "next/link";
import { StudentEvalListItem } from "@/types/evaluasi-sekolah";

type Props = {
  rows: StudentEvalListItem[];
  /** untuk nomor urut */
  page: number;
  perPage: number;
};

export default function SchoolStudentsEvalTable({ rows, page, perPage }: Props) {
  const startNo = (page - 1) * perPage;

  return (
    <div className="rounded-xl">
      <div className="-mx-4 overflow-x-auto">
        <div className="min-w-[1100px] px-4">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-[#0F67B1] text-white">
              <tr>
                {[
                  "NO",
                  "NAMA SISWA",
                  "PERIODE",
                  "JURUSAN",
                  "PERUSAHAAN",
                  "NILAI AKHIR\nMAGANG",
                  "LAPORAN\nMAGANG",
                ].map((h, i, arr) => (
                  <th
                    key={i}
                    className={`px-4 py-2 font-semibold text-center whitespace-pre-line
                      ${i === 0 ? "rounded-tl-lg" : ""}
                      ${i === arr.length - 1 ? "rounded-tr-lg" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500 bg-white"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-t border-b border-gray-100 text-xs hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-800 text-center">
                      {startNo + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-left">{r.name}</td>
                    <td className="px-4 py-3 text-gray-800 text-left">
                      {r.periodLabel}
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-left">{r.major}</td>
                    <td className="px-4 py-3 text-gray-800 text-left">{r.company}</td>
                    <td className="px-4 py-3 text-gray-800 text-center">
                      {r.finalScore ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/dashboard-sekolah/laporan-evaluasi/${r.id}`}
                        className="inline-flex items-center justify-center h-9 w-[100px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-md hover:bg-[#0c599b] transition text-sm"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
