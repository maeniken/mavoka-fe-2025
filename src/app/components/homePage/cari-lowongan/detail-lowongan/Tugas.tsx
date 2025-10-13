"use client";
import { PiBookBookmarkFill } from "react-icons/pi";

interface Props {
  tugas?: string[] | string; // allow string fallback
}

export default function Tugas({ tugas = [] }: Props) {
  // Normalize: if backend already sends array (cast), use it.
  // If somehow a JSON string arrives (e.g. "[\"a\",\"b\"]"), parse it.
  let items: string[] = [];
  if (Array.isArray(tugas)) {
    items = tugas.filter(Boolean);
  } else if (typeof tugas === "string" && tugas.trim() !== "") {
    const trimmed = tugas.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) items = parsed.filter(Boolean);
      } catch {
        // fallback: treat as delimiter separated
        items = trimmed.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
      }
    } else {
      items = trimmed.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="mt-10 bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <PiBookBookmarkFill className="text-[#0F67B1] text-xl" />
        <h3 className="font-bold">Tugas & Tanggung Jawab</h3>
      </div>
      {items.length > 0 ? (
        <ol className="list-decimal pl-5 space-y-1 marker:font-medium text-sm">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      ) : (
        <p>-</p>
      )}
    </div>
  );
}
