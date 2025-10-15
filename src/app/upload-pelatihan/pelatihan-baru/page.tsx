"use client";

import { useRouter } from "next/navigation";
import PelatihanFormView from "@/app/components/upload-lowongan-pelatihan/PelatihanFormView";
import { PelatihanFormValues } from "@/types/pelatihan";
import { createPelatihan } from "@/lib/api-pelatihan";
import { Suspense } from "react";

export default function PelatihanBaruPage() {
  const router = useRouter();

  const handleSaveDraft = async (v: PelatihanFormValues) => {
    try {
      await createPelatihan(v, { publish: false }); // history_batch tidak dikirim
      router.replace("/upload-pelatihan?tab=draft");
    } catch (e: any) {
      console.error(e);
      throw e;
    } finally {
      // no-op; per-button loading handled in form
    }
  };

  const handlePublish = async (v: PelatihanFormValues) => {
    try {
      await createPelatihan(v, { publish: true }); // history_batch = []
      router.replace("/upload-pelatihan?tab=terpasang");
    } catch (e: any) {
      console.error(e);
      throw e;
    } finally {
      // no-op; per-button loading handled in form
    }
  };

  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
      <div className="-mt-[15px]">
        <PelatihanFormView
          mode="create"
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      </div>
    </Suspense>
  );
}
