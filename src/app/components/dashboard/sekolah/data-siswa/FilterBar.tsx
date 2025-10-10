"use client";
import React from "react";

type Props = {
  jurusanOptions: string[];
  tahunOptions: string[];
  statusOptions: string[]; 

  selectedJurusan: string;
  selectedTahun: string;
  selectedStatus: string;

  onChangeJurusan: (val: string) => void;
  onChangeTahun: (val: string) => void;
  onChangeStatus: (val: string) => void;
};

export default function FilterBar({
  jurusanOptions,
  tahunOptions,
  statusOptions,
  selectedJurusan,
  selectedTahun,
  selectedStatus,
  onChangeJurusan,
  onChangeTahun,
  onChangeStatus,
}: Props) {
  return (
    <div
      className="
        flex flex-wrap items-center gap-x-4 gap-y-3
      "
    >
      {/* Jurusan */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#575F6E]">Jurusan</span>
        <select
          value={selectedJurusan}
          onChange={(e) => onChangeJurusan(e.target.value)}
          className="h-9 min-w-[180px] rounded-md border border-[#B7B7B7] px-3 text-sm bg-white"
        >
          <option value="">Semua Jurusan</option>
          {jurusanOptions.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </select>
      </div>

      {/* Tahun Ajaran */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#575F6E]">Tahun <br /> Ajaran</span>
        <select
          value={selectedTahun}
          onChange={(e) => onChangeTahun(e.target.value)}
          className="h-9 min-w-[180px] rounded-md border border-[#B7B7B7] px-3 text-sm bg-white"
        >
          {tahunOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Status Akun */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#575F6E]">Status <br />Akun</span>
        <select
          value={selectedStatus}
          onChange={(e) => onChangeStatus(e.target.value)}
          className="h-9 min-w-[180px] rounded-md border border-[#B7B7B7] px-3 text-sm bg-white"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
