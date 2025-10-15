"use client";

import { useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";
import type { CreateLowonganPayload } from "@/types/lowongan";
import { createLowonganAktif, createLowonganDraft } from "@/lib/api-lowongan";

export default function PageLowonganBaru() {
  const router = useRouter();

  return (
    <div className="p-5">
      <LowonganFormView
        mode="create"
        onSaveDraft={async (payload: CreateLowonganPayload) => {
          await createLowonganDraft(payload);
        }}
        onUnggah={async (payload: CreateLowonganPayload) => {
          await createLowonganAktif(payload);
        }}
        successFor={["draft", "unggah"]}
        successMessageDraft="Data Lowongan Magang yang Anda inputkan berhasil disimpan di draft!"
        successMessageUnggah="Data Lowongan Magang yang Anda inputkan berhasil diunggah!"
        onSuccessClose={(action) => {
          if (action === "unggah")
            router.replace("/upload-lowongan?tab=terpasang");
          else router.replace("/upload-lowongan?tab=draft");
        }}
      />
    </div>
  );
}
