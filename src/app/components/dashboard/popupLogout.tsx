"use client";

import * as React from "react";
import { FiLogOut } from "react-icons/fi";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void; 
};

export default function ConfirmLogoutDialog({ open, onClose, onConfirm }: Props) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md rounded-xl border-4 border-[#0F67B1] bg-white shadow-xl"
        >
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiLogOut className="text-[#BA0000]" size={48} />
            </div>

            <p className="font-semibold text-[#858585]">
              Apakah Anda Yakin Ingin Keluar ?
            </p>

            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                onClick={onConfirm} 
                className="flex items-center justify-center h-11 w-36 rounded-md text-white bg-[#BA0000] font-semibold hover:bg-red-800 transition"
              >
                Ya
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center h-11 w-32 rounded-md bg-[#0F67B1] text-white hover:bg-[#0F67B1]/80 font-semibold transition"
              >
                Tidak
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
