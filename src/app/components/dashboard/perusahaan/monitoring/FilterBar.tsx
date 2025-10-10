"use client";

type Props = {
  positions: string[];
  selected: string;
  onChange: (value: string) => void;
  label?: string;         // default: "Posisi"
  placeholder?: string;   // default: "Pilih Posisi"
};

export default function FilterBar({
  positions,
  selected,
  onChange,
  label = "Posisi",
  placeholder = "Semua Posisi",
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">{label}</span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-[#0F67B1] min-w-[160px]"
      >
        <option value="">{placeholder}</option>
        {positions.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
