"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { Lowongan, CreateLowonganPayload } from "@/types/lowongan";
import { getLowonganByIdClient /*, updateLowonganDraft */ } from "@/lib/api-lowongan";

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
  const handleSave = async (_payload: CreateLowonganPayload, _id?: number) => {
    // kalau API sudah siap:
    // await updateLowonganDraft(_id!, _payload);
    // (biarkan kosong dulu — popup sukses ditangani LowonganFormView)
    console.log("SAVE draft clicked for id:", _id, _payload);
  };

  // Jadikan draft -> terpasang
  const handleUnggah = async (_payload: CreateLowonganPayload, _id?: number) => {
    console.log("UNGGAH clicked for id:", _id, _payload);
  };

  if (loading) return <div className="p-6">Memuat…</div>;
  if (!initial) return <div className="p-6 text-red-600">Data tidak ditemukan.</div>;

  return (
    <div className="p-5">
<LowonganFormView
  mode="edit-draft"
  initial={initial}
  onSave={(p, id) => {/* update draft */}}
  onUnggah={(p, id) => {/* unggah */}}
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
