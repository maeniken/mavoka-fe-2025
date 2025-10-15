"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import { BiEdit } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import Pagination from "@/app/components/dashboard/Pagination";
import { Pelatihan, Batch } from "@/types/pelatihan";
import ModalTambahBatch from "./ModalTambahBatch";
import ModalHistoryBatch from "./ModalHistoryBatch";
import ModalConfirmDelete from "./ModalConfirmDelete";
import { getPelatihanSaya, deletePelatihan, createBatch } from "@/lib/api-pelatihan";

export default function TablePelatihanTerpasang() {
  const [rows, setRows] = useState<Pelatihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (
    type: "success" | "error",
    message: string,
    timeout = 3000
  ) => {
    setToast({ type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), timeout);
  };

useEffect(() => {
  (async () => {
    try {
      const all = await getPelatihanSaya();
      const published = all.filter((r) => Array.isArray(r.historyBatch));
      setRows(published);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const startIndex = (page - 1) * perPage;

  const current = useMemo(
    () => rows.slice(startIndex, startIndex + perPage),
    [rows, startIndex, perPage]
  );

  const selectedPel = selectedId ? rows.find((r) => r.id === selectedId) : undefined;
  const selectedBatches: Batch[] = selectedPel?.batches ?? [];
  const nextBatchName = `Batch ${selectedBatches.length + 1}`;

  const openAddBatch = (id: number) => {
    setSelectedId(id);
    setShowAddBatch(true);
  };
  const openHistory = (id: number) => {
    setSelectedId(id);
    setShowHistory(true);
  };
  const openDelete = (id: number) => {
    setSelectedId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deletePelatihan(selectedId);
      setRows((prev) => prev.filter((r) => r.id !== selectedId));
      setShowDelete(false);
      showToast("success", "Data pelatihan berhasil dihapus.");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Gagal menghapus";
      showToast("error", msg);
    }
  };

  return (
    <div className="rounded-xl">
      <div className="-mx-6 overflow-x-auto">
        <div className="min-w-[1400px] px-6">
          <table className="w-full text-xs">
            <thead className="bg-[#0F67B1] text-white">
              <tr>
                {[
                  "NO",
                  "NAMA PELATIHAN",
                  "DESKRIPSI",
                  "KATEGORI",
                  "CAPAIAN PEMBELAJARAN",
                  "BATCH",
                  "DETAIL",
                  "AKSI",
                ].map((h, i, arr) => (
                  <th
                    key={i}
                    className={`px-4 py-3 font-semibold text-center ${
                      i === 0 ? "rounded-tl-lg" : ""
                    } ${i === arr.length - 1 ? "rounded-tr-lg" : ""} ${
                      h === "BATCH"
                        ? "w-[170px] text-center"
                        : h === "DETAIL"
                        ? "w-[120px] text-center"
                        : h === "AKSI"
                        ? "w-[140px] text-center"
                        : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  {Array.from({ length: perPage }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-t border-gray-100 animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-3 w-6 bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3">
                        <div className="h-3 w-40 bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3">
                        <div className="h-3 w-80 bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3">
                        <div className="h-3 w-72 bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="h-9 w-[140px] mx-auto bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="h-9 w-[100px] mx-auto bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-3">
                          <div className="h-4 w-4 bg-gray-200 rounded" />
                          <div className="h-4 w-4 bg-gray-200 rounded" />
                          <div className="h-4 w-4 bg-gray-200 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center bg-white text-red-600">
                    {error}
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500 bg-white">
                    Belum ada pelatihan terpasang.
                  </td>
                </tr>
              ) : (
                current.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 align-top text-xs hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {startIndex + idx + 1}
                    </td>

                    <td className="px-4 py-3 text-gray-800">
                      <span className="font-medium">{item.namaPelatihan}</span>
                    </td>

                    <td className="px-4 py-3 text-gray-800 max-w-[320px]">
                      <p className="truncate text-xs">{item.deskripsi}</p>
                    </td>

                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {item.kategori}
                    </td>

                    <td className="px-4 py-3 text-gray-800 max-w-[320px]">
                      <p className="truncate text-xs">{item.capaian}</p>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openAddBatch(item.id)}
                        className="inline-flex items-center justify-center h-9 w-[140px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-md hover:bg-[#0c599b] transition text-sm"
                      >
                        Tambah Batch
                      </button>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/upload-pelatihan/detail/${item.id}`}
                        className="inline-flex items-center justify-center h-9 w-[100px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-md hover:bg-[#0c599b] transition text-sm"
                      >
                        Detail
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          aria-label="History Batch"
                          onClick={() => openHistory(item.id)}
                          className="text-[#0F67B1] hover:opacity-80 shadow-none"
                          title="History Batch"
                        >
                          <FaHistory size={16} />
                        </button>

                        <Link
                          aria-label="Edit"
                          href={`/upload-pelatihan/edit/published/${item.id}`}
                          className="text-[#0F67B1] hover:opacity-80 shadow-none"
                          title="Edit"
                        >
                          <BiEdit size={18} />
                        </Link>

                        <button
                          aria-label="Hapus"
                          onClick={() => openDelete(item.id)}
                          className="text-red-600 hover:opacity-80 shadow-none"
                          title="Hapus"
                        >
                          <BsTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        perPage={perPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        perPageOptions={[5, 10, 20]}
      />

      <ModalTambahBatch
        open={showAddBatch && selectedId !== null}
        onClose={() => setShowAddBatch(false)}
        nextBatchName={nextBatchName}
        onSave={async ({ start, end, name }) => {
          if (!selectedId) return;
          try {
            const newBatch = await createBatch(selectedId, { name: name || nextBatchName, start, end });
            setRows((prev) =>
              prev.map((r) =>
                r.id === selectedId
                  ? {
                      ...r,
                      batches: [newBatch, ...(r.batches ?? [])],
                    }
                  : r
              )
            );
            setShowAddBatch(false);
            showToast("success", "Batch berhasil ditambahkan.");
          } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || "Gagal menambahkan batch";
            showToast("error", msg);
          }
        }}
      />

      <ModalHistoryBatch
        open={showHistory && selectedId !== null}
        onClose={() => setShowHistory(false)}
        batches={selectedBatches}
      />

      <ModalConfirmDelete
        open={showDelete && selectedId !== null}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title="Hapus Pelatihan"
        message="Yakin Anda ingin menghapus pelatihan ini?"
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-md border px-4 py-3 shadow-md text-sm bg-white ${
            toast.type === "success"
              ? "border-green-300 text-green-700"
              : "border-red-300 text-red-700"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-1 inline-block h-2 w-2 rounded-full ${
                toast.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
              aria-label="Tutup notifikasi"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
