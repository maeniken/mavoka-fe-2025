"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PelatihanFormView from "@/app/components/upload-lowongan-pelatihan/PelatihanFormView";
import { PelatihanFormValues, Pelatihan } from "@/types/pelatihan";
import { getPelatihanSaya, updatePelatihan } from "@/lib/api-pelatihan";

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

export default function EditPublishedPelatihanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<Pelatihan | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await getPelatihanSaya();
        const row = all.find((r) => r.id === Number(id));
        if (!row) {
          setErr("Data tidak ditemukan.");
        } else {
          setItem(row);
        }
      } catch (e: any) {
        setErr(e?.response?.data?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const initial = useMemo(() => (item ? toFormValues(item) : undefined), [item]);

  if (loading) return <div className="p-6">Memuat…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!item || !initial) return <div className="p-6">Data tidak ditemukan.</div>;

  return (
    <div className="px-6
      pt-1 tablet:pt-2 pb-6 -mt-3 tablet:-mt-4
      space-y-5
      -mx-2 tablet:-mx-3 desktop:-mx-6">
      <PelatihanFormView
        mode="editPublished"
        title="Ubah Data Pelatihan"
        initial={initial}
        onSave={async (v: PelatihanFormValues) => {
          try {
            // tetap publish=true agar statusnya tidak kembali ke draft
            await updatePelatihan(Number(id), v, { publish: true });
            alert("Perubahan tersimpan.");
            router.replace("/upload-pelatihan?tab=terpasang");
          } catch (e: any) {
            alert(e?.response?.data?.message || "Gagal menyimpan perubahan");
          }
        }}
      />
    </div>
  );
}
