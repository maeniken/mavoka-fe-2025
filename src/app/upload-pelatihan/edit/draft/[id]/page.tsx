"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { Lowongan, CreateLowonganPayload } from "@/types/lowongan";
import { getLowonganByIdClient /*, saveDraftApi, unggahApi */ } from "@/lib/api-lowongan";

export default function PageEditDraft() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const numericId = useMemo(() => Number(id), [id]);
  const [initial, setInitial] = useState<Partial<Lowongan> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      console.log("[EditDraft] fetch id =", numericId);
      const data = await getLowonganByIdClient(numericId);
      if (!mounted) return;
      setInitial(data ?? null);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [numericId]);

  if (loading) return <div className="p-6">Memuat…</div>;
  if (!initial) return <div className="p-6 text-red-600">Data tidak ditemukan.</div>;

  return (
    <div className="p-6">
      <LowonganFormView
        key={`edit-draft-${numericId}`} // paksa re-mount saat pindah id
        mode="edit-draft"
        initial={initial}
        onSaveDraft={async (payload: CreateLowonganPayload, lowonganId?: number) => {
          console.log("[EditDraft] Simpan Draft", { lowonganId, payload });
          // await saveDraftApi(lowonganId!, payload);
        }}
        onUnggah={async (payload: CreateLowonganPayload, lowonganId?: number) => {
          console.log("[EditDraft] Unggah dari Draft", { lowonganId, payload });
          // await unggahApi(lowonganId!, payload);
          // router.replace("/upload-lowongan?tab=terpasang");
        }}
        successFor={["draft", "unggah"]}
        successMessage="Perubahan berhasil diproses."
        onSuccessClose={(action) => {
          if (action === "draft") router.replace("/upload-lowongan?tab=draft");
          if (action === "unggah") router.replace("/upload-lowongan?tab=terpasang");
        }}
      />
    </div>
  );
}
