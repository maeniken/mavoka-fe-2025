"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PelatihanFormView from "@/app/components/upload-lowongan-pelatihan/PelatihanFormView";
import { Pelatihan, PelatihanFormValues } from "@/types/pelatihan";
import { getPelatihanSaya } from "@/lib/api-pelatihan";

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

  if (loading) return <div className="p-6">Memuat…</div>;
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
          <ul className="mt-4 space-y-2 text-sm">
            {item.batches.map((b, i) => (
              <li
                key={b.id ?? i}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <span className="font-medium">{b.name}</span>
                <span className="text-gray-600">
                  {(b.start || "-")} — {(b.end || "-")}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    b.status === "selesai"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {b.status === "selesai" ? "Selesai" : "Sedang berjalan"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
