"use client";
import { BsJournalBookmarkFill } from "react-icons/bs";

interface Props {
  benefit?: string[]; // ⬅️ ubah jadi array
}

export default function Keuntungan({ benefit = [] }: Props) {
  return (
    <div className="mt-10 bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <BsJournalBookmarkFill className="text-[#0F67B1] text-xl" />
        <h3 className="font-bold">Keuntungan</h3>
      </div>
      {benefit.length > 0 ? (
        <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed">
          {benefit.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-500">-</p>
      )}
    </div>
  );
}
