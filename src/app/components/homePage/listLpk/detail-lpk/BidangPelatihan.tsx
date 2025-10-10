"use client";
import { PiBookBookmarkFill } from "react-icons/pi";

interface Props {
  bidang_pelatihan?: string | null;
}

export default function BidangPelatihan({ bidang_pelatihan = "-" }: Props) {
  const items: string[] = (() => {
    if (!bidang_pelatihan || bidang_pelatihan === '-' ) return [];
    // Pisahkan dengan koma atau titik koma
    const raw = bidang_pelatihan.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    // Hilangkan duplikat sambil mempertahankan urutan
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const r of raw) { if (!seen.has(r.toLowerCase())) { seen.add(r.toLowerCase()); unique.push(r); } }
    return unique;
  })();

  return (
    <div className="mt-10 bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <PiBookBookmarkFill className="text-[#0F67B1] text-xl" />
        <h2 className="font-bold text-lg">Bidang Pelatihan</h2>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">-</p>
      ) : (
        <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
