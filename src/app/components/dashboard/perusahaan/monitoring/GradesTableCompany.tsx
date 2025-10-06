"use client";

import { useMemo, useState } from "react";
import { BiEdit, BiPlus, BiTrash } from "react-icons/bi";

export type CompanyGradeAspect = {
  id: string;
  name: string;
  criteria: string[];
  score?: number | null; // 0–100
};

type Props = {
  initialRows?: CompanyGradeAspect[];
  onSave?: (rows: CompanyGradeAspect[], average: number) => void;
};

export default function GradesTableCompany({
  initialRows = defaultRows,
  onSave,
}: Props) {
  const [rows, setRows] = useState<CompanyGradeAspect[]>(
    initialRows.map((r) => ({ ...r, criteria: [...r.criteria] }))
  );

  // id baris yang sedang di-edit (null = tidak sedang edit)
  const [editingId, setEditingId] = useState<string | null>(null);

  const average = useMemo(() => {
    const nums = rows
      .map((r) => (typeof r.score === "number" ? r.score : null))
      .filter((n): n is number => n !== null);
    if (!nums.length) return 0;
    const sum = nums.reduce((a, b) => a + b, 0);
    return Math.round((sum / nums.length) * 100) / 100;
  }, [rows]);

  // helpers
  const clampScore = (v: unknown) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    if (Number.isNaN(n)) return null;
    return Math.max(0, Math.min(100, n));
  };

  const startEdit = (id: string) => setEditingId(id);

  const normalizeAll = () =>
    setRows((prev) =>
      prev.map((r) => ({ ...r, score: clampScore(r.score) }))
    );

  const setScore = (id: string, val: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, score: val === "" ? null : Number(val) } : r
      )
    );

  const setCriterion = (id: string, idx: number, val: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, criteria: r.criteria.map((c, i) => (i === idx ? val : c)) }
          : r
      )
    );

  const addCriterion = (id: string) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, criteria: [...r.criteria, ""] } : r
      )
    );

  const removeCriterion = (id: string, idx: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, criteria: r.criteria.filter((_, i) => i !== idx) }
          : r
      )
    );

  const handleSave = () => {
    normalizeAll();
    setEditingId(null); // keluar dari mode edit
    onSave?.(
      rows.map((r) => ({ ...r, score: clampScore(r.score) })),
      average
    );
  };

  const isEditing = editingId !== null;

  return (
    <div className="bg-white rounded-md p-4">
      <div className="rounded-[5px] ring-1 ring-[#D9D5EC] overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <colgroup>
            <col className="w-[60px]" />
            <col className="w-[260px]" />
            <col />
            <col className="w-[120px]" />
            <col className="w-[80px]" />
          </colgroup>

          <thead className="bg-white text-black">
            <tr>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide">
                NO
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">
                ASPEK
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">
                KRITERIA
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">
                NILAI
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">
                AKSI
              </th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {rows.map((r, idx) => {
              const rowEditing = editingId === r.id;

              return (
                <tr key={r.id} className="border-t border-gray-200 align-top text-xs">
                  {/* NO */}
                  <td className="px-2 py-2 text-gray-700 text-center">
                    {idx + 1}
                  </td>

                  {/* ASPEK */}
                  <td className="px-2 py-2 text-gray-900 border-l border-gray-200">
                    <span className="font-medium">{r.name}</span>
                  </td>

                  {/* KRITERIA */}
                  <td
                    className={[
                      "px-3 py-2 border-l border-gray-200",
                      rowEditing ? "ring-2 ring-[#0F67B1]" : "",
                    ].join(" ")}
                  >
                    {!rowEditing ? (
                      r.criteria.length ? (
                        <ul className="list-disc pl-5 space-y-1 text-gray-800">
                          {r.criteria.map((c, i) => (
                            <li key={i}>{c || <span className="text-gray-400">—</span>}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="w-full text-center text-gray-400">-</div>
                      )
                    ) : (
                      <div className="space-y-2">
                        {r.criteria.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={c}
                              onChange={(e) => setCriterion(r.id, i, e.target.value)}
                              placeholder={`Poin ${i + 1}`}
                              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-[#0F67B1]"
                            />
                            <button
                              onClick={() => removeCriterion(r.id, i)}
                              className="p-2 rounded-md text-red-600 hover:bg-red-50 shadow-none"
                              title="Hapus poin"
                            >
                              <BiTrash />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addCriterion(r.id)}
                          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                        >
                          <BiPlus /> Tambah Poin
                        </button>
                      </div>
                    )}
                  </td>

                  {/* NILAI */}
                  <td
                    className={[
                      "px-3 py-2 border-l border-gray-200 text-center pr-5",
                      rowEditing ? "ring-2 ring-[#0F67B1]" : "",
                    ].join(" ")}
                  >
                    {!rowEditing ? (
                      typeof r.score === "number" ? (
                        <span className="text-gray-900">{r.score}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.score ?? ""}
                        onChange={(e) => setScore(r.id, e.target.value)}
                        className="w-[88px] rounded-md border px-3 py-2 text-center outline-none focus:ring-2 focus:ring-[#0F67B1]"
                        placeholder="0-100"
                      />
                    )}
                  </td>

                  {/* AKSI */}
                  <td className="px-3 py-2 border-l border-gray-200 text-center">
                    {/* Saat edit: tidak ada tombol (sesuai permintaan) */}
                    {!rowEditing ? (
                      <button
                        onClick={() => startEdit(r.id)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-[#0F67B1] hover:bg-blue-50 shadow-none"
                        title="Edit baris"
                      >
                        <BiEdit size={18} />
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-500">Sedang mengedit…</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* RATA-RATA */}
            <tr className="border-t border-gray-200">
              <td
                colSpan={3}
                className="px-3 py-2 text-center text-gray-700 font-medium bg-white"
              >
                Rata–Rata
              </td>
              <td className="px-3 py-2 text-center pr-5 text-gray-900 font-semibold border-l border-gray-200">
                {average || 0}
              </td>
              <td className="px-3 py-2 border-l border-gray-200" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* tombol simpan: hanya tampil ketika sedang edit */}
      {isEditing && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-[6px] bg-[#0F67B1] px-4 py-2 text-white hover:bg-[#0c599b]"
          >
            Simpan
          </button>
        </div>
      )}
    </div>
  );
}

/** default data agar tampilan langsung sama seperti desain */
const defaultRows: CompanyGradeAspect[] = [
  {
    id: "asp-teknis",
    name: "Aspek Teknis",
    criteria: [
      "Menguasai Materi atau Alat Kerja Dengan Baik",
      "Menghasilkan Pekerjaan Sesuai Dengan Standar Yang Ditetapkan",
      "Menunjukkan Kerapian dan Ketelitian Dalam Bekerja",
    ],
    score: 80,
  },
  {
    id: "asp-komunikasi",
    name: "Aspek Komunikasi",
    criteria: [
      "Mampu Menyampaikan Ide Dengan Jelas dan Efektif",
      "Menunjukkan Sikap Sopan Santun Dalam Berkomunikasi",
      "Mendengarkan dengan Penuh Perhatian",
    ],
    score: 70,
  },
  {
    id: "asp-kerjasama",
    name: "Aspek Kerjasama",
    criteria: [
      "Bersedia Membantu Rekan Kerja",
      "Aktif Berpartisipasi Dalam Kegiatan Tim",
      "Menghargai Pendapat Orang Lain",
    ],
    score: 70,
  },
  {
    id: "asp-disiplin",
    name: "Aspek Disiplin",
    criteria: [
      "Hadir Tepat Waktu dan Memiliki Tingkat Kehadiran yang Baik",
      "Mematuhi Peraturan yang Berlaku",
      "Menjaga Konsistensi Dalam Kinerja",
    ],
    score: 70,
  },
  {
    id: "asp-inisiatif",
    name: "Aspek Inisiatif",
    criteria: [
      "Berusaha Menemukan Solusi Secara Mandiri",
      "Memberikan Ide-Ide Baru yang Konstruktif",
      "Tidak Hanya Menunggu Instruksi, Tetapi Proaktif Dalam Bekerja",
    ],
    score: 70,
  },
];
