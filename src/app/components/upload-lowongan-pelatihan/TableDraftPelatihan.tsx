"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BiEdit } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import Pagination from "@/app/components/dashboard/Pagination";
import { Pelatihan } from "@/types/pelatihan";
import { getPelatihanSaya, deletePelatihan } from "@/lib/api-pelatihan";
import ModalConfirmDelete from "./ModalConfirmDelete";

type Props = {
  initialData?: Pelatihan[];
  onDetail?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function TableDraftPelatihan({
  initialData,
  onDetail,
  onEdit,
  onDelete,
}: Props) {
  const [rows, setRows] = useState<Pelatihan[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = (type: 'success' | 'error', message: string, timeout = 2500) => {
    setToast({ type, message });
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current && window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }, timeout);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
        toastTimer.current = null;
      }
    };
  }, []);

useEffect(() => {
  (async () => {
    try {
      const all = await getPelatihanSaya();
      const drafts = all.filter((r) => !Array.isArray(r.historyBatch));
      setRows(drafts);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const start = (page - 1) * perPage;

  const current = useMemo(
    () => rows.slice(start, start + perPage),
    [rows, start, perPage]
  );

  const openDelete = (id: number) => {
    setSelectedId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deletePelatihan(selectedId);
      setRows((prev) => prev.filter((r) => r.id !== selectedId));
      onDelete?.(selectedId);
      showToast('success', 'Data pelatihan berhasil dihapus.');
    } catch (e: any) {
      showToast('error', e?.response?.data?.message || 'Gagal menghapus data pelatihan.');
    } finally {
      setShowDelete(false);
      setSelectedId(null);
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
                  "DETAIL",
                  "AKSI",
                ].map((h, i, arr) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-semibold ${
                      i === 0 ? "rounded-tl-lg" : ""
                    } ${i === arr.length - 1 ? "rounded-tr-lg" : ""} ${
                      h === "DETAIL"
                        ? "w-[120px] text-center"
                        : h === "AKSI"
                        ? "w-[140px] text-center"
                        : "text-center"
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
                        <div className="h-9 w-[100px] mx-auto bg-gray-200 rounded" />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-3">
                          <div className="h-4 w-4 bg-gray-200 rounded" />
                          <div className="h-4 w-4 bg-gray-200 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center bg-white text-red-600">
                    {error}
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500 bg-white"
                  >
                    Belum ada draft pelatihan. Klik <b>Tambah</b> untuk menambah data.
                  </td>
                </tr>
              ) : (
                current.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 align-center text-xs hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {start + idx + 1}
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

                    {/* DETAIL */}
                    <td className="px-4 py-3 text-center">
                      {onDetail ? (
                        <button
                          onClick={() => onDetail(item.id)}
                          className="inline-flex items-center justify-center h-9 w-[100px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-none hover:bg-[#0c599b] transition text-sm"
                        >
                          Detail
                        </button>
                      ) : (
                        <Link
                          href={`/upload-pelatihan/detail/${item.id}`}
                          className="inline-flex items-center justify-center h-9 w-[100px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-none hover:bg-[#0c599b] transition text-sm"
                        >
                          Detail
                        </Link>
                      )}
                    </td>

                    {/* AKSI */}
                    <td>
                      <div className="flex justify-center items-center gap-3">
                        {onEdit ? (
                          <button
                            aria-label="Edit"
                            onClick={() => onEdit(item.id)}
                            className="text-[#0F67B1] hover:opacity-80 shadow-none"
                            title="Edit"
                          >
                            <BiEdit size={18} />
                          </button>
                        ) : (
                          <Link
                            aria-label="Edit"
                            href={`/upload-pelatihan/edit/draft/${item.id}`}
                            className="text-[#0F67B1] hover:opacity-80 shadow-none"
                            title="Edit"
                          >
                            <BiEdit size={18} />
                          </Link>
                        )}

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

      <ModalConfirmDelete
        open={showDelete && selectedId !== null}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title=""
        message="Apakah Anda Yakin Ingin Menghapus Data Pelatihan Magang ?"
      />

      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[60] min-w-[260px] max-w-[360px] rounded-lg px-4 py-3 shadow-lg border ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-300 text-green-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {/* status dot */}
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
            </div>
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-xs opacity-70 hover:opacity-100"
              aria-label="Tutup notifikasi"
              title="Tutup"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
