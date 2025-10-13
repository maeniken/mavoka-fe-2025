"use client";

interface Props {
  totalLowongan?: number;
}

export default function CompanyDetail({ totalLowongan = 0 }: Props) {
  const label = totalLowongan === 0 ? 'Tidak ada lowongan aktif' : 'Lowongan Aktif';
  return (
    <div className="mt-10 text-center bg-white rounded-xl border p-6">
      <h3 className="mt-2 text-[#0F67B1] font-semibold">{totalLowongan}</h3>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </div>
  );
}
