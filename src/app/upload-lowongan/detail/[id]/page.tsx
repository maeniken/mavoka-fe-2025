"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { Lowongan } from "@/types/lowongan";
import { getLowonganByIdClient } from "@/lib/api-lowongan";

export default function PageDetailLowongan() {
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

  if (loading) return <div className="p-6">Memuat…</div>;
  if (!initial) return <div className="p-6 text-red-600">Data tidak ditemukan.</div>;

  return (
    <div className="p-5">
      <LowonganFormView mode="detail" initial={initial} />
    </div>
  );
}
