"use client";
import { useMemo } from "react";

type Option = { label: string; value: string };
type Props = {
  majors: Option[];
  periods: Option[];
  selectedMajor?: string;
  selectedPeriod?: string;
  onChange: (next: { major?: string; period?: string }) => void;
  /** Jika true (default), hanya render isi tanpa wrapper card */
  embedded?: boolean;
};

export default function SchoolEvalFilterBar({
  majors,
  periods,
  selectedMajor,
  selectedPeriod,
  onChange,
  embedded = true,
}: Props) {
  const majorValue = useMemo(() => selectedMajor ?? "", [selectedMajor]);
  const periodValue = useMemo(() => selectedPeriod ?? "", [selectedPeriod]);

  const Content = (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 font-medium">Jurusan</span>
        <select
          value={majorValue}
          onChange={(e) =>
            onChange({ major: e.target.value || undefined, period: selectedPeriod })
          }
          className="min-w-[220px] h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih Jurusan</option>
          {majors.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 font-medium">Periode</span>
        <select
          value={periodValue}
          onChange={(e) =>
            onChange({ major: selectedMajor, period: e.target.value || undefined })
          }
          className="min-w-[220px] h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih Periode</option>
          {periods.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (embedded) return Content;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
      {Content}
    </div>
  );
}
