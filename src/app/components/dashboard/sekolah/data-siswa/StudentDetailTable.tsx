"use client";
import React from "react";
import { StudentApplicationDetail } from "@/types/unggah-data-siswa";

type Props = {
  rows: StudentApplicationDetail[];
  /** offset nomor baris kalau nanti dipaginate */
  rowNumberOffset?: number;
  /** kalau sudah dibungkus card putih di parent, set true */
  noCardWrapper?: boolean;
  /** tampilkan skeleton di tbody saat loading */
  loading?: boolean;
  /** jumlah baris skeleton */
  skeletonCount?: number;
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
  loading = false,
  skeletonCount = 6,
}: Props) {
  const SkeletonBar = ({ w = "w-40" }: { w?: string }) => (
    <div className={`h-3 rounded bg-gray-200/80 animate-pulse ${w}`} />
  );

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
          {loading && Array.from({ length: skeletonCount }).map((_, i) => (
            <tr key={`sk-${i}`} className="border-b text-xs">
              <td className="px-4 py-3 w-14 text-center">
                <div className="mx-auto h-3 w-6 rounded bg-gray-200/80 animate-pulse" />
              </td>
              <td className="px-4 py-3 text-center"><SkeletonBar w="w-48" /></td>
              <td className="px-4 py-3 text-center"><SkeletonBar w="w-40" /></td>
              <td className="px-4 py-3 text-center"><SkeletonBar w="w-40" /></td>
              <td className="px-4 py-3 text-center">
                <div className="mx-auto h-6 w-20 rounded-full bg-gray-200/80 animate-pulse" />
              </td>
            </tr>
          ))}

          {!loading && rows.map((r, idx) => (
            <tr key={r.id} className="border-b hover:bg-gray-50 text-xs">
              <td className="px-4 py-3 w-14 text-center">{rowNumberOffset + idx + 1}</td>
              <td className="px-4 py-3 text-center">{r.namaSiswa}</td>
              <td className="px-4 py-3 text-center">{r.perusahaan}</td>
              <td className="px-4 py-3 text-center">{r.divisiPenempatan}</td>
              <td className="px-4 py-3 text-center">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}

          {!loading && rows.length === 0 && (
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
