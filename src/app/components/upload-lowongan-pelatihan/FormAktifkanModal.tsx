"use client";

import { useEffect, useState } from "react";

type FormValues = {
  mulaiMagang: string;
  selesaiMagang: string;
  deadline_lamaran: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
};

export default function FormAktifkanModal({
  open,
  onClose,
  onSubmit,
  initial,
}: Props) {
  const [mulaiMagang, setMulaiMagang] = useState("");
  const [selesaiMagang, setSelesaiMagang] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (!open) return;
    setMulaiMagang(initial?.mulaiMagang ?? "");
    setSelesaiMagang(initial?.selesaiMagang ?? "");
    setDeadline(initial?.deadline_lamaran ?? "");
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      mulaiMagang,
      selesaiMagang,
      deadline_lamaran: deadline,
    });
  };

  const inputBase =
    "w-full rounded border px-3 py-2 text-sm text-[#3a3a3a] placeholder-[#858585] focus:outline-none focus:border-[#0F67B1] border-[#B7B7B7]";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl border-4 border-[#0F67B1] bg-white shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-center mb-6">
              Pengaktifan Lowongan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold">
                  Periode Mulai Magang
                </label>
                <input
                  type="date"
                  className={`${inputBase} mt-1`}
                  value={mulaiMagang}
                  onChange={(e) => setMulaiMagang(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold">
                  Periode Selesai Magang
                </label>
                <input
                  type="date"
                  className={`${inputBase} mt-1`}
                  value={selesaiMagang}
                  onChange={(e) => setSelesaiMagang(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold">Tanggal Penutupan</label>
                <input
                  type="date"
                  className={`${inputBase} mt-1`}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-[5px] border border-[#0F67B1] text-[#0F67B1] hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-[5px] bg-[#0F67B1] text-white hover:bg-[#0c599b]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
