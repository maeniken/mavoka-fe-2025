"use client";
import React from "react";
import { StudentRow } from "@/types/unggah-data-siswa";

type Props = {
  rows: StudentRow[];
  onDetail: (id: number) => void;
  rowNumberOffset?: number;
  noCardWrapper?: boolean;
};

function AccountStatusChip({ status }: { status: "Aktif" | "Tidak" }) {
  const active = status === "Aktif";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
        ${active ? "bg-[#CDFFCD] text-[#007F00]" : "bg-red-100 text-red-700"}`}
    >
      <span className={`text-base leading-none ${active ? "text-[#007F00]" : "text-red-600"}`}>
        ●
      </span>
      {status}
    </span>
  );
}

export default function StudentsTable({
  rows,
  onDetail,
  rowNumberOffset = 0,
  noCardWrapper = false,
}: Props) {
  const Table = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[760px]">
        <thead>
          <tr className="bg-[#0F67B1] text-white text-center">
            {["NO", "NAMA SISWA", "JURUSAN", "TAHUN AJARAN", "STATUS AKUN", "DETAIL"].map(
              (h, i, arr) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-bold ${
                    i === 0 ? "rounded-tl-[5px]" : ""
                  } ${i === arr.length - 1 ? "rounded-tr-[5px]" : ""}`}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} className="border-b hover:bg-gray-50 text-xs">
              <td className="px-4 py-3 w-14 text-center">{rowNumberOffset + idx + 1}</td>
              <td className="px-4 py-3">{r.nama}</td>
              <td className="px-4 py-3">{r.jurusan}</td>
              <td className="px-4 py-3 text-center">{r.tahunAjaran}</td>
              <td className="px-4 py-3 text-center">
                <AccountStatusChip status={r.statusAkun} />
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onDetail(r.id)}
                  className="inline-flex h-9 w-24 items-center justify-center whitespace-nowrap
                             rounded-[5px] bg-[#0F67B1] text-xs font-semibold text-white shadow-sm
                             hover:brightness-110 active:scale-[.99]"
                >
                  Detail
                </button>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                Tidak ada data siswa.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // kalau mau table+filtering dalam satu card, panggil komponen ini dengan noCardWrapper=true
  return noCardWrapper ? Table : <div className="bg-white rounded-md p-4">{Table}</div>;
}
