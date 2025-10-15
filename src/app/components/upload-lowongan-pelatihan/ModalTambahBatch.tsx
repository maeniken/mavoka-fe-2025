"use client";
import React, { useState, useEffect } from "react";
import { Batch } from "@/types/pelatihan";

type Props = {
  open: boolean;
  onClose: () => void;
  nextBatchName: string;
  onSave: (batch: Batch) => void | Promise<void>;
};

export default function ModalTambahBatch({
  open,
  onClose,
  nextBatchName,
  onSave,
}: Props) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStart("");
      setEnd("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[90%] max-w-[520px] rounded-2xl bg-white p-5 md:p-6 ring-1 ring-[#0F67B1]/40 shadow-xl">
        <h3 className="text-center font-semibold mb-4">Periode Pelatihan Magang</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Batch</label>
            <input
              value={nextBatchName}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Mulai</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Selesai</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              if (!start || !end || submitting) return;
              setSubmitting(true);
              try {
                await onSave({ name: nextBatchName, start, end });
              } finally {
                setSubmitting(false);
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#0F67B1] text-white hover:bg-[#0d5692] disabled:opacity-50 inline-flex items-center gap-2"
            disabled={!start || !end || submitting}
          >
            {submitting ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden="true" />
                <span>Menyimpan…</span>
              </>
            ) : (
              <span>Simpan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
