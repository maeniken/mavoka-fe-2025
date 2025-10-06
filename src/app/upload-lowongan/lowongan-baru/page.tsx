"use client";

import { useRouter } from "next/navigation";
import LowonganFormView from "@/app/components/upload-lowongan-pelatihan/LowonganFormView";

export default function PageLowonganBaru() {
  const router = useRouter();

  return (
    <div className="p-5">
      <LowonganFormView
        mode="create"
        onSaveDraft={() => {}}
        onUnggah={() => {}}
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
