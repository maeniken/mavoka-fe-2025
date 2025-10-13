"use client";
import React from "react";

type Props = {
  rowCount?: number;
};

export default function StudentsTableSkeleton({ rowCount = 10 }: Props) {
  const headers = [
    "NO",
    "NAMA SISWA",
    "JURUSAN",
    "TAHUN AJARAN",
    "STATUS AKUN",
    "DETAIL",
  ];

  // helper to render a gray bar with pulse
  const Bar = ({ w = "w-24" }: { w?: string }) => (
    <div className={`h-3 rounded bg-gray-200/80 animate-pulse ${w}`} />
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[760px]">
        <thead>
          <tr className="bg-[#0F67B1] text-white text-center">
            {headers.map((h, i, arr) => (
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
          {Array.from({ length: rowCount }).map((_, idx) => (
            <tr key={idx} className="border-b text-xs">
              <td className="px-4 py-3 w-14 text-center">
                <div className="mx-auto h-3 w-6 rounded bg-gray-200/80 animate-pulse" />
              </td>
              <td className="px-4 py-3">
                <Bar w="w-40" />
              </td>
              <td className="px-4 py-3">
                <Bar w="w-32" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="inline-block">
                  <Bar w="w-24" />
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="mx-auto h-6 w-20 rounded-full bg-gray-200/80 animate-pulse" />
              </td>
              <td className="px-4 py-3 text-center">
                <div className="mx-auto h-9 w-24 rounded-[5px] bg-gray-200/80 animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
