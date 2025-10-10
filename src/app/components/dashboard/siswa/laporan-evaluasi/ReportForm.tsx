"use client";
import { useState } from "react";

type FormData = {
  date: string;
  activity: string;
  output: string;
  obstacle: string;
  solution: string;
  photoFile?: File | null;
};

export default function ReportForm({
  weekNumber,
  onSubmit,
  submitting = false,
}: {
  weekNumber: number;
  onSubmit: (data: FormData) => void;
  submitting?: boolean;
}) {
  const [form, setForm] = useState<FormData>({
    date: "",
    activity: "",
    output: "",
    obstacle: "",
    solution: "",
    photoFile: null,
  });

  const set = (k: keyof FormData, v: any) => setForm((s) => ({ ...s, [k]: v }));

  // Kelas dasar input/textarea agar konsisten
  const baseField =
    "w-full rounded-lg border outline-none text-sm text-black placeholder-[#858585] " +
    "border-[#B7B7B7] focus:border-[#0F67B1] focus:ring-2 focus:ring-[#0F67B1]/30";

  return (
    <div className="rounded-2xl bg-white p-5 md:p-6 border border-gray-200">
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">
          Laporan & Evaluasi Minggu {weekNumber}
        </h2>
        <p className="text-sm text-gray-500">
          Pastikan informasi laporan dan evaluasi terisi dengan benar.
        </p>
        <hr className="mt-3 border-gray-200" />
      </div>

      <label className="block text-sm font-semibold text-gray-800 mb-1">
        Tanggal
      </label>
      <input
        type="date"
        value={form.date}
        onChange={(e) => set("date", e.target.value)}
        className={`${baseField} px-3 py-2 mb-4`}
        placeholder="Masukkan tanggal…"
      />

      <label className="block text-sm font-semibold text-gray-800 mb-1">
        Deskripsi Kegiatan
      </label>
      <textarea
        value={form.activity}
        onChange={(e) => set("activity", e.target.value)}
        className={`${baseField} h-28 px-3 py-2 mb-4 resize-y`}
        placeholder="Masukkan Deskripsi…"
      />

      <label className="block text-sm font-semibold text-gray-800 mb-1">
        Output/Hasil Kerja
      </label>
      <textarea
        value={form.output}
        onChange={(e) => set("output", e.target.value)}
        className={`${baseField} h-28 px-3 py-2 mb-4 resize-y`}
        placeholder="Masukkan Output…"
      />

      <label className="block text-sm font-semibold text-gray-800 mb-1">
        Hambatan
      </label>
      <textarea
        value={form.obstacle}
        onChange={(e) => set("obstacle", e.target.value)}
        className={`${baseField} h-28 px-3 py-2 mb-4 resize-y`}
        placeholder="Masukkan Hambatan…"
      />

      <label className="block text-sm font-semibold text-gray-800 mb-1">
        Solusi
      </label>
      <textarea
        value={form.solution}
        onChange={(e) => set("solution", e.target.value)}
        className={`${baseField} h-28 px-3 py-2 mb-4 resize-y`}
        placeholder="Masukkan Solusi…"
      />

{/* Foto Kegiatan */}
<label className="block text-sm font-semibold text-gray-800 mb-1">
  Foto Kegiatan
</label>

<div className="max-w-sm relative">
  {/* input asli: tidak pakai sr-only, tapi disembunyikan tanpa memengaruhi layout */}
  <input
    id="photoFile"
    type="file"
    accept="image/png,image/jpeg"
    onChange={(e) => set("photoFile", e.target.files?.[0] ?? null)}
    className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
  />

  {/* wrapper kotak seperti input */}
  <div
    className="
      flex items-center gap-3 rounded-lg border px-2 py-1.5
      border-[#B7B7B7]
      focus-within:border-[#0F67B1] focus-within:ring-2 focus-within:ring-[#0F67B1]/30
    "
  >
    {/* tombol telusuri */}
    <label
      htmlFor="photoFile"
      className="
        shrink-0 cursor-pointer rounded-md bg-gray-100 px-3 py-1
        text-xs font-semibold text-gray-800 hover:bg-gray-200
      "
    >
      Telusuri file
    </label>

    {/* nama file */}
    <span
      className={`min-w-0 flex-1 truncate text-xs ${
        form.photoFile ? "text-black" : "text-[#858585]"
      }`}
    >
      {form.photoFile ? form.photoFile.name : "Pilih file…"}
    </span>
  </div>

  <p className="mt-2 text-xs text-gray-500">
    Hanya mendukung file dengan format .jpg dan .png
  </p>
</div>


      <div className="mt-6 flex justify-end">
        <button
          disabled={submitting}
          onClick={() => onSubmit(form)}
          className="rounded-lg bg-[#0F67B1] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Unggah
        </button>
      </div>
    </div>
  );
}
