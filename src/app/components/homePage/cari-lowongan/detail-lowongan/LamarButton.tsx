"use client";
import { useState } from "react";
import { IoPaperPlaneOutline } from "react-icons/io5";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { useParams } from "next/navigation";
import { requireRoleAuthHeader } from "@/lib/auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function LamarButton() {
  const params = useParams();
  const lowonganId = params?.id ?? null;

  const [open, setOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [transkripFile, setTranskripFile] = useState<File | null>(null);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hitung jumlah lamaran aktif (lamar, wawancara, penawaran) milik siswa login
  // Hitung jumlah total unik lowongan yang pernah dilamar oleh siswa
  async function getTotalUniqueLamaranCount(): Promise<number> {
    try {
      let headers: Record<string, string> | undefined = undefined;
      try {
        headers = requireRoleAuthHeader("siswa");
      } catch {}
      const res = await fetch(`${BASE_URL}/pelamar`, {
        method: "GET",
        headers,
        credentials: headers ? "omit" : "include",
        cache: "no-store",
      });
      if (!res.ok) return 0; // kalau gagal, jangan blokir sisi FE; BE tetap validasi
      const json: any = await res.json().catch(() => null);
      const arr: any[] = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
        const uniq = new Set<string>();
        for (const it of arr) {
          const lowonganId = String(it?.lowongan_id ?? it?.lowongan?.id ?? '');
          if (lowonganId) uniq.add(lowonganId);
        }
        return uniq.size;
    } catch {
      return 0;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lowonganId) {
      alert("Tidak dapat menemukan ID lowongan.");
      return;
    }
    if (!cvFile || !transkripFile) {
      alert("Mohon unggah CV dan Transkrip terlebih dahulu.");
      return;
    }

    // Pre-check batas 5 total unique lowongan yang pernah dilamar
    const uniqCount = await getTotalUniqueLamaranCount();
    if (uniqCount >= 5) {
      alert("Maksimal 5 lowongan yang dapat Anda lamar.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("lowongan_id", String(lowonganId));
      form.append("cv", cvFile);
      form.append("transkrip", transkripFile);

      // Try to attach bearer header if available for siswa
      let headers: Record<string, string> | undefined = undefined;
      try {
        headers = requireRoleAuthHeader("siswa");
      } catch (e) {
        // no token available — proceed but the backend may reject
        console.warn("No siswa token available, request will rely on cookies if present.");
      }

      const res = await fetch(`${BASE_URL}/pelamar`, {
        method: "POST",
        body: form,
        headers,
        credentials: headers ? "omit" : "include",
      });

      // Baca JSON bila memungkinkan, tanpa menampilkan raw body ke pengguna
      let json: any = null;
      try { json = await res.clone().json(); } catch {}

      if (res.ok) {
        setOpen(false);
        setOpenSuccess(true);
        setCvFile(null);
        setTranskripFile(null);
      } else {
        // Pesan yang ramah pengguna
        let message = "Gagal mengirim lamaran.";
        const apiMsg = json?.message || json?.error || null;
        if (res.status === 401) message = "Sesi Anda berakhir. Silakan login sebagai Siswa.";
        else if (res.status === 403) message = "Anda tidak berhak melakukan aksi ini.";
        else if (res.status === 409) {
          // Backend sudah membatasi maksimal 5 lamaran aktif
          message = apiMsg || "Maksimal 5 lamaran aktif diperbolehkan.";
        } else if (res.status === 422 && json?.errors) {
          const firstField = Object.keys(json.errors)[0];
          const errVal = json.errors[firstField];
          const firstMsg = Array.isArray(errVal) ? errVal[0] : String(errVal);
          message = firstMsg || apiMsg || message;
        } else if (apiMsg) {
          message = apiMsg;
        }
        console.error("lamar error:", res.status, json ?? res.statusText);
        alert(message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim lamaran. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="bg-[#0F67B1] text-white hover:bg-[#0c599b] flex items-center gap-2 px-4 py-2 rounded"
        >
          <IoPaperPlaneOutline size={20} />
          Lamar Sekarang
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="border-4 border-[#0F67B1] bg-white shadow-xl p-6 rounded-2xl w-full max-w-md">
            <h2 className="text-center font-bold text-lg mb-6">Lamar Magang</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">CV</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <p className="text-sm text-gray-500">Hanya mendukung file dengan format .PDF</p>
              </div>

              <div>
                <label className="block mb-1 font-semibold">Transkrip Akademik</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setTranskripFile(e.target.files?.[0] ?? null)}
                  className="w-full border rounded px-2 py-1"
                  required
                />
                <p className="text-sm text-gray-500">Hanya mendukung file dengan format .PDF</p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-[5px] border border-[#0F67B1] text-[#0F67B1] hover:bg-gray-100"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-[5px] bg-[#0F67B1] text-white hover:bg-[#0c599b]"
                  disabled={loading}
                >
                  {loading ? "Mengunggah..." : "Unggah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <SuccessModal
        open={openSuccess}
        title="Berhasil"
        message="Lamaran Anda berhasil diunggah!"
        onClose={() => {
          setOpenSuccess(false);
        }}
      />
    </>
  );
}
