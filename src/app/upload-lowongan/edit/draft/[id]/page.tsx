"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { Lowongan, CreateLowonganPayload } from "@/types/lowongan";
import { getLowonganByIdClient, updateLowonganDraft, updateLowonganTerpasang } from "@/lib/api-lowongan";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

export default function PageEditLowonganDraft() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [initial, setInitial] = useState<Partial<Lowongan> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getLowonganByIdClient(Number(id));
      setInitial(data ?? {});
      setLoading(false);
    })();
  }, [id]);

  // === HANDLERS ===
  // Simpan tetap sebagai draft
  const handleSave = async (payload: CreateLowonganPayload, _id?: number) => {
    if (!_id) return;
    await updateLowonganDraft(_id, payload);
  };

  // Jadikan draft -> terpasang
  const handleUnggah = async (payload: CreateLowonganPayload, _id?: number) => {
    if (!_id) return;
    await updateLowonganTerpasang(_id, payload);
  };

  if (loading) return <FullPageLoader label="Memuat…" variant="primary" styleType="dashed" />;
  if (!initial) return <div className="p-6 text-red-600">Data tidak ditemukan.</div>;

  return (
    <div className="p-5">
<LowonganFormView
  mode="edit-draft"
  initial={initial}
  onSaveDraft={handleSave}
  onSave={handleSave}
  onUnggah={handleUnggah}
  successFor={["save","unggah","draft"]}
  successMessageDraft="Data Lowongan Magang yang Anda inputkan berhasil disimpan di draft!"
  successMessageUnggah="Data Lowongan Magang yang Anda inputkan berhasil diunggah!"
  successMessage="Perubahan berhasil disimpan."
  onSuccessClose={(action) => {
    if (action === "unggah") router.replace("/upload-lowongan?tab=terpasang");
    else router.replace("/upload-lowongan?tab=draft");
  }}
/>

    </div>
  );
}
