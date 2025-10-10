"use client";
import React from "react";
import { StudentApplicationDetail } from "@/types/unggah-data-siswa";

type Props = {
  rows: StudentApplicationDetail[];
  /** offset nomor baris kalau nanti dipaginate */
  rowNumberOffset?: number;
  /** kalau sudah dibungkus card putih di parent, set true */
  noCardWrapper?: boolean;
};

/* ---- Badge status dengan dot, warna konsisten ---- */
const STATUS_STYLE: Record<string, { wrap: string; dot: string }> = {
  Lamar:      { wrap: "bg-gray-100 text-gray-700",   dot: "text-gray-600" },
  Interview:  { wrap: "bg-yellow-100 text-yellow-700", dot: "text-yellow-600" },
  Wawancara:  { wrap: "bg-yellow-100 text-yellow-700", dot: "text-yellow-600" },
  Penawaran:  { wrap: "bg-blue-100 text-blue-700",   dot: "text-blue-600" },
  Diterima:   { wrap: "bg-green-100 text-green-700", dot: "text-green-600" },
  Ditolak:    { wrap: "bg-red-100 text-red-700",     dot: "text-red-600" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE["Lamar"];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.wrap}`}>
      <span className={`text-base leading-none ${s.dot}`}>●</span>
      {status}
    </span>
  );
}

export default function StudentDetailTable({
  rows,
  rowNumberOffset = 0,
  noCardWrapper = false,
}: Props) {
  const Table = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[860px]">
        <thead>
          <tr className="bg-[#0F67B1] text-white text-center">
            {[
              "NO",
              "NAMA",
              "PERUSAHAAN",
              "DIVISI PENEMPATAN",
              "STATUS",
            ].map((h, i, arr) => (
              <th
                key={h}
                className={`px-4 py-3 text-xs font-bold ${
                  i === 0 ? "rounded-tl-[5px]" : ""
                } ${i === arr.length - 1 ? "rounded-tr-[5px]" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} className="border-b hover:bg-gray-50 text-xs">
              <td className="px-4 py-3 w-14 text-center">{rowNumberOffset + idx + 1}</td>
              <td className="px-4 py-3">{r.namaSiswa}</td>
              <td className="px-4 py-3">{r.perusahaan}</td>
              <td className="px-4 py-3">{r.divisiPenempatan}</td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return noCardWrapper ? Table : <div className="bg-white rounded-md p-4">{Table}</div>;
}
