"use client";
import React from "react";

/*
  Skeleton loader for applicants table while data is being fetched.
  Mirrors the structure & column widths of `table.tsx` so layout shift is minimized.
*/
export default function ApplicantsSkeleton({ rows = 6 }: { rows?: number }) {
  const headers = [
    "NO",
    "NAMA SISWA",
    "POSISI",
    "ASAL SEKOLAH",
    "JURUSAN",
    "EMAIL",
    "CV",
    "TRANSKRIP NILAI",
    "DETAIL",
    "STATUS",
    "AKSI",
  ];

  const colClasses = [
    "w-12",
    "w-56",
    "w-56",
    "w-52",
    "w-60",
    "w-64",
    "w-16",
    "w-28",
    "w-28 whitespace-nowrap",
    "w-36 whitespace-nowrap",
    "w-[210px] whitespace-nowrap",
  ];

  return (
    <div className="min-w-full" aria-busy="true" aria-label="Memuat data pelamar">
      <table className="sticky top-0 z-10 w-full min-w-[1200px] table-fixed border-collapse">
        <thead>
          <tr className="text-center text-white">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`bg-[#0F67B1] px-4 py-3 text-xs font-bold ${colClasses[i]} ${
                  i === 0 ? "rounded-tl-[5px]" : ""
                } ${i === headers.length - 1 ? "rounded-tr-[5px]" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b text-xs last:border-b-0">
              {colClasses.map((c, i) => (
                <td key={i} className={`px-4 py-4 ${i === 0 ? "text-center" : ""}`}>
                  <div className="flex justify-center">
                    <span className="h-3 w-full max-w-[90%] animate-pulse rounded bg-gray-200/80 dark:bg-gray-300/20" />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Sedang memuat...</span>
    </div>
  );
}
