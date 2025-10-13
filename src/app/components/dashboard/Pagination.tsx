"use client";
import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;

  perPage: number;
  onPerPageChange: (n: number) => void;
  perPageOptions?: number[];
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  perPageOptions = [5, 10, 20, 50],
}: Props) {
  const pages: (number | "...")[] = [];
  const win = 1;
  const start = Math.max(2, page - win);
  const end = Math.min(totalPages - 1, page + win);

  if (totalPages >= 1) pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="mt-4 flex items-center justify-end gap-4">
      <div className="flex items-center gap-2">
        <span className="text-black text-xs">Baris per halaman :</span>
        <select
          className="h-9 border-none px-0 py-0 outline-none font-semibold text-black text-xs text-center hover:cursor-pointer"
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-2 text-xs disabled:opacity-20 shadow-none flex items-center"
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            aria-label="Sebelumnya"
          >
            <IoIosArrowBack size={16} />
          </button>

          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} className="px-2 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                className={`rounded-md px-4 py-2 text-xs ${
                  p === page
                    ? "bg-[#0F67B1] text-white shadow-none"
                    : "border-none shadow-none"
                }`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="rounded-md border px-3 py-2 text-xs disabled:opacity-20 shadow-none flex items-center"
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            aria-label="Berikutnya"
          >
            <IoIosArrowForward size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
