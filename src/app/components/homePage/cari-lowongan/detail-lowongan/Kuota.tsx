"use client";

interface Props { value: number | string | null | undefined; }

export default function Kuota({ value }: Props) {
  const num = typeof value === "string" ? parseInt(value, 10) : value ?? 0;
  return (
    <div className="mt-6 bg-white rounded-xl border flex flex-col items-center justify-center py-8 text-center relative overflow-hidden">
      <span className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="text-2xl font-bold text-[#0F67B1] tracking-wide">{num}</div>
      <div className="mt-2 text-sm font-medium text-gray-600 uppercase tracking-wider">Kuota Posisi</div>
      <span className="mt-4 block w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
}
