"use client";
import { PiStudent } from "react-icons/pi";

type Props = { persyaratan?: string[] | null };

export default function Persyaratan({ persyaratan = [] }: Props) {
  const items = Array.isArray(persyaratan)
    ? persyaratan.filter(Boolean).map((s) => String(s).trim()).filter((s) => s.length)
    : [];
  return (
    <div className="mt-10 bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <PiStudent className="text-[#0F67B1] text-xl" />
        <h3 className="font-bold">Persyaratan</h3>
      </div>
      {items.length ? (
        <ol className="list-decimal list-inside space-y-1 text-sm leading-relaxed">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-slate-500">-</p>
      )}
    </div>
  );
}
