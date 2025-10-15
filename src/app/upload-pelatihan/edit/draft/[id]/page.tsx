"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PelatihanFormView from "@/app/components/upload-lowongan-pelatihan/PelatihanFormView";
import { Pelatihan, PelatihanFormValues } from "@/types/pelatihan";
import { getPelatihanSaya, updatePelatihan } from "@/lib/api-pelatihan";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

function toFormValues(p: Pelatihan): PelatihanFormValues {
  const list =
    (p as any).capaianList ??
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

export default function PageEditDraft() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const numericId = useMemo(() => Number(id), [id]);
  const [item, setItem] = useState<Pelatihan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        console.log("[EditDraft Pelatihan] fetch id =", numericId);
        const all = await getPelatihanSaya();
        if (!mounted) return;
        const row = all.find((r) => Number(r.id) === numericId) || null;
        if (!row) setError("Data tidak ditemukan.");
        setItem(row);
      } catch (e: any) {
        if (!mounted) return;
        const status = e?.response?.status;
        if (status === 401) {
          setError("Sesi Anda berakhir atau tidak memiliki akses. Silakan login kembali.");
        } else {
          setError(e?.response?.data?.message || "Gagal memuat data draft.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  // Compute form initial values unconditionally to keep hook order stable
  const initial = useMemo(() => (item ? toFormValues(item) : undefined), [item]);

  if (loading)
    return (
      <FullPageLoader label="Memuat data draft..." spinnerSize={56} variant="primary" styleType="dashed" />
    );
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!item || !initial) return <div className="p-6 text-red-600">Data tidak ditemukan.</div>;

  return (
    <div className="p-6">
      <PelatihanFormView
        key={`edit-draft-pelatihan-${numericId}`}
        mode="editDraft"
        initial={initial}
        onSaveDraft={async (v: PelatihanFormValues) => {
          await updatePelatihan(numericId, v, { publish: false });
        }}
        onPublish={async (v: PelatihanFormValues) => {
          await updatePelatihan(numericId, v, { publish: true });
        }}
      />
    </div>
  );
}
