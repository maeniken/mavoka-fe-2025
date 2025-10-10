"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PelatihanFormView from "@/app/components/upload-lowongan-pelatihan/PelatihanFormView";
import { Pelatihan, PelatihanFormValues } from "@/types/pelatihan";
import { getPelatihanSaya } from "@/lib/api-pelatihan";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

function toFormValues(p: Pelatihan): PelatihanFormValues {
  const list =
    p.capaianList ??
    (p.capaian
      ? p.capaian
          .split(/[;\n]/g)
          .map((s) => s.trim())
          .filter(Boolean)
      : []);
  return {
    namaPelatihan: p.namaPelatihan,
    deskripsi: p.deskripsi,
    kategori: p.kategori,
    capaian: list.length ? list : [""],
  };
}

export default function DetailPelatihanPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Pelatihan | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const formatDMY = (iso?: string | null) => {
    if (!iso) return "-";
    const raw = iso.includes("T") ? iso.split("T")[0] : (iso.includes(" ") ? iso.split(" ")[0] : iso);
    const parts = raw.split("-");
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}/${yyyy}`;
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await getPelatihanSaya();
        const row = all.find((r) => r.id === Number(id));
        if (!row) setErr("Data pelatihan tidak ditemukan.");
        else setItem(row);
      } catch (e: any) {
        setErr(e?.response?.data?.message || "Gagal memuat data pelatihan");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const initial = useMemo(() => (item ? toFormValues(item) : undefined), [item]);
  const toTime = (iso?: string | null) => {
    if (!iso) return 0;
    const raw = iso.includes("T") ? iso.split("T")[0] : (iso.includes(" ") ? iso.split(" ")[0] : iso);
    const parts = raw.split("-");
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime();
    }
    const d = new Date(iso);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  if (loading)
    return (
      <FullPageLoader label="Memuat data pelatihan..." spinnerSize={56} variant="primary" styleType="dashed" />
    );
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!item || !initial) return <div className="p-6">Data pelatihan tidak ditemukan.</div>;

  return (
    <div className=" px-6
      pt-1 tablet:pt-2 pb-6 -mt-3 tablet:-mt-4
      space-y-5
      -mx-2 tablet:-mx-3 desktop:-mx-6">
      <PelatihanFormView
        mode="detail"
        title="Detail Data Pelatihan"
        initial={initial}
      />

      {/* (Opsional) tampilkan ringkas History Batch bila ingin terlihat di halaman detail */}
      {Array.isArray(item.batches) && item.batches.length > 0 && (
        <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
          <h3 className="font-bold mb-2">History Batch</h3>
          <div className="mt-3 h-px w-full bg-[#E3E3E3]" />

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[600px]">
              <table className="w-full text-xs">
                <thead className="bg-[#0F67B1] text-white">
                  <tr>
                    {[
                      "NO",
                      "NAMA BATCH",
                      "PERIODE",
                      "STATUS",
                    ].map((h, i, arr) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-center font-semibold ${
                          i === 0 ? "rounded-tl-lg" : ""
                        } ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...item.batches]
                    .sort((a, b) => {
                      const at = toTime(a.start) || toTime(a.end);
                      const bt = toTime(b.start) || toTime(b.end);
                      return bt - at; // newest first
                    })
                    .map((b, i) => (
                      <tr key={b.id ?? i} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-center">{i + 1}</td>
                        <td className="px-4 py-3 text-center">{b.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {formatDMY(b.start)} - {formatDMY(b.end)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                              b.status === "selesai"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                b.status === "selesai" ? "bg-green-700" : "bg-yellow-700"
                              }`}
                            />
                            {b.status === "selesai" ? "Selesai" : "Sedang berjalan"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
