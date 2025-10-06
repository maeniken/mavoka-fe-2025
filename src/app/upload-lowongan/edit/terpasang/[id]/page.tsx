"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { Lowongan, CreateLowonganPayload } from "@/types/lowongan";
import { getLowonganByIdClient /*, updateLowonganTerpasang */ } from "@/lib/api-lowongan";

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
  const handleSave = async (_payload: CreateLowonganPayload, _id?: number) => {
    // await updateLowonganTerpasang(_id!, _payload);
    // cukup kosong; modal sukses akan muncul karena kita set successFor & successMessage
  };

  if (loading) return <div className="p-6">Memuat…</div>;
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
