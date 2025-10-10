"use client";
import { PiBookBookmarkFill } from "react-icons/pi";

interface JurusanLike { id: number; nama_jurusan: string }
interface Props {
  // Bisa datang sebagai array objek {id,nama_jurusan} atau array string dari backend yang belum dinormalisasi
  jurusan?: (JurusanLike | string)[];
}

export default function KompetensiKeahlian({ jurusan = [] }: Props) {
  // Normalisasi: jika elemen string -> konversi ke objek dengan id incremental lokal
  const normalized: JurusanLike[] = jurusan.map((j, idx) =>
    typeof j === 'string'
      ? { id: idx + 1, nama_jurusan: j }
      : j
  );
  return (
    <div className="mt-10 bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <PiBookBookmarkFill className="text-[#0F67B1] text-xl" />
        <h2 className="font-bold text-lg">Kompetensi Keahlian</h2>
      </div>

      {normalized.length > 0 ? (
        <ol className="list-decimal list-inside space-y-1">
          {normalized.map((j) => (
            <li className="text-sm" key={j.id}>{j.nama_jurusan}</li>
          ))}
        </ol>
      ) : (
        <p>-</p>
      )}
    </div>
  );
}
