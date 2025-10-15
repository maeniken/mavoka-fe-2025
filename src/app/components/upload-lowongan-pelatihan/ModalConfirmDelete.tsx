"use client";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
};

export default function ModalConfirmDelete({
  open,
  onClose,
  onConfirm,
  title = "Hapus Pelatihan",
  message = "Yakin Anda ingin menghapus pelatihan ini?",
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[90%] max-w-[520px] rounded-2xl bg-white p-6 md:p-7 ring-2 ring-[#0F67B1] shadow-xl">
        {title ? (
          <h3 className="font-semibold mb-2 text-center text-gray-900">{title}</h3>
        ) : null}
        <p className="text-base text-gray-700 text-center">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-[#0F67B1] text-[#0F67B1] hover:bg-[#0F67B1]/5"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-[#0F67B1] text-white hover:bg-[#0d5692]"
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}
