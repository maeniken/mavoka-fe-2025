"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { Lowongan, CreateLowonganPayload } from "@/types/lowongan";
import { getLowonganByIdClient, updateLowonganTerpasang } from "@/lib/api-lowongan";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";

export default function PageEditLowonganTerpasang() {
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

  // Handler Simpan – sementara belum panggil endpoint (kalau API siap, panggil di sini)
  const handleSave = async (payload: CreateLowonganPayload, _id?: number) => {
    if (!_id) return;
    await updateLowonganTerpasang(_id, payload);
  };

  if (loading) return <FullPageLoader label="Memuat…" variant="primary" styleType="dashed" />;
  if (!initial) return <div className="p-6 text-red-600">Data tidak ditemukan.</div>;

  return (
    <div className="p-5">
      <LowonganFormView
        mode="edit-terpasang"
        initial={initial}
        onBack={() => router.replace("/upload-lowongan?tab=terpasang")}
        onSave={handleSave}
        successFor={["save"]}
        successMessage="Perubahan berhasil disimpan."
        onSuccessClose={() => router.replace("/upload-lowongan?tab=terpasang")}
      />
    </div>
  );
}
