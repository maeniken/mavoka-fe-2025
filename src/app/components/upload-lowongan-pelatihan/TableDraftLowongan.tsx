"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BiEdit } from "react-icons/bi";
import Pagination from "@/app/components/dashboard/Pagination";
import { Lowongan } from "@/types/lowongan";
import { getLowonganPerusahaan } from "@/lib/api-lowongan";

const toArray = (v: unknown): string[] =>
  Array.isArray(v) ? v : typeof v === "string" && v.trim() ? [v] : [];
const summarize = (v: unknown, max = 2) => {
  const arr = toArray(v);
  return arr.length <= max
    ? arr.join(", ")
    : `${arr.slice(0, max).join(", ")} +${arr.length - max} lainnya`;
};

export default function TableDraftLowongan() {
  const [rows, setRows] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const data = await getLowonganPerusahaan();
        setRows(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Sembunyikan scroll vertikal ketika loading
  useEffect(() => {
    if (!loading) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflowY = html.style.overflowY;
    const prevBodyOverflowY = body.style.overflowY;

    html.style.overflowY = "hidden";
    body.style.overflowY = "hidden";

    return () => {
      html.style.overflowY = prevHtmlOverflowY;
      body.style.overflowY = prevBodyOverflowY;
    };
  }, [loading]);

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const start = (page - 1) * perPage;
  // Urutkan terbaru dulu berdasarkan created_at
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return tb - ta; // newest first
    });
  }, [rows]);

  const current = useMemo(
    () => sortedRows.slice(start, start + perPage),
    [sortedRows, start, perPage]
  );

  const headerCells: { key: string; node: React.ReactNode }[] = [
    { key: "NO", node: "NO" },
    { key: "POSISI", node: "POSISI" },
    { key: "DESKRIPSI", node: "DESKRIPSI" },
    { key: "KUOTA", node: "KUOTA" },
    {
      key: "TANGGAL PENUTUPAN",
      node: (
        <>
          <span className="block">TANGGAL</span>
          <span className="block">PENUTUPAN</span>
        </>
      ),
    },
    {
      key: "PERIODE MULAI MAGANG",
      node: (
        <>
          <span className="block">PERIODE MULAI</span>
          <span className="block">MAGANG</span>
        </>
      ),
    },
    {
      key: "PERIODE SELESAI MAGANG",
      node: (
        <>
          <span className="block">PERIODE SELESAI</span>
          <span className="block">MAGANG</span>
        </>
      ),
    },
    { key: "LOKASI PENEMPATAN", node: "LOKASI PENEMPATAN" },
    {
      key: "TUGAS & TANGGUNG JAWAB",
      node: (
        <>
          <span className="block">TUGAS &amp; TANGGUNG</span>
          <span className="block">JAWAB</span>
        </>
      ),
    },
    { key: "PERSYARATAN", node: "PERSYARATAN" },
    { key: "KEUNTUNGAN", node: "KEUNTUNGAN" },
    { key: "AKSI", node: "AKSI" },
  ];

  return (
    <div className="rounded-xl">
      <div className="-mx-6 overflow-x-auto">
        {/* samakan lebar minimum dengan tabel lain */}
        <div className="min-w-[2300px] px-6">
          <table className="w-full text-xs">
            <thead className="bg-[#0F67B1] text-white">
              <tr>
                {headerCells.map((h, i, arr) => (
                  <th
                    key={h.key}
                    className={[
                      "px-3 py-1.5",
                      "text-[11px] leading-tight",
                      "font-semibold text-center align-middle",
                      i === 0 ? "rounded-tl-lg" : "",
                      i === arr.length - 1 ? "rounded-tr-lg" : "",
                    ].join(" ")}
                  >
                    {h.node}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: Math.max(5, Math.min(perPage, 10)) }).map(
                  (_, idx) => (
                    <tr
                      key={`skeleton-${idx}`}
                      className="border-t border-gray-100 bg-white"
                      aria-busy="true"
                    >
                      <td className="px-3 py-2">
                        <div className="h-3 w-6 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-72 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-10 rounded bg-gray-200 animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-28 rounded bg-gray-200 animate-pulse mx-auto" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-44 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-64 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-64 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-3 w-64 rounded bg-gray-200 animate-pulse" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-6 w-24 rounded bg-gray-200 animate-pulse mx-auto" />
                      </td>
                    </tr>
                  )
                )
              ) : error ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center bg-white text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-4 py-10 text-center text-gray-500 bg-white"
                  >
                    Belum ada draft lowongan. Klik <b>Buat Lowongan Baru</b> untuk
                    menambah data.
                  </td>
                </tr>
              ) : (
                current.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    {/* body: padding seragam + nowrap untuk tanggal/periode */}
                    <td className="px-3 py-2 text-center">
                      {start + idx + 1}
                    </td>
                    <td className="px-3 py-2 font-medium">{item.posisi}</td>
                    <td className="px-3 py-2 max-w-[360px] truncate">
                      {item.deskripsi}
                    </td>
                    <td className="px-3 py-2 text-center">{item.kuota}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {item.deadline_lamaran}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {item.mulaiMagang}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      {item.selesaiMagang}
                    </td>
                    <td className="px-3 py-2">{item.lokasi_penempatan}</td>
                    <td className="px-3 py-2 max-w-[320px] truncate">
                      {summarize(item.tugas)}
                    </td>
                    <td className="px-3 py-2 max-w-[320px] truncate">
                      {summarize(item.persyaratan)}
                    </td>
                    <td className="px-3 py-2 max-w-[320px] truncate">
                      {summarize(item.keuntungan)}
                    </td>

                    {/* AKSI — disamakan dengan tabel terpasang: pakai Link langsung */}
                    <td className="px-3 py-2">
                      <div className="flex justify-center items-center gap-3">
                        <Link
                          href={`/upload-lowongan/detail/${item.id}`}
                          className="inline-flex items-center justify-center h-8 px-3 rounded-[5px] bg-[#0F67B1] text-white text-xs font-medium hover:bg-[#0c599b] transition"
                        >
                          Detail
                        </Link>

                        <Link
                          aria-label="Edit"
                          href={`/upload-lowongan/edit/draft/${item.id}`}
                          className="text-[#0F67B1] hover:opacity-80"
                          title="Edit"
                        >
                          <BiEdit size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {!loading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={(n) => {
            setPerPage(n);
            setPage(1);
          }}
          perPageOptions={[5, 10, 20]}
        />
      )}
    </div>
  );
}
