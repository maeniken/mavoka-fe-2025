'use client';
import StudentApplicationsTable from "@/app/components/dashboard/siswa/pengajuan-magang/table";
import React, { useEffect, useMemo, useState } from "react";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import { useApplicants } from "@/lib/mock-pelamar";
import useMyApplications from "@/lib/useMyApplications";

export default function PengajuanMagangPage() {
  // Pakai hook applicants dalam mode mock agar tidak memanggil endpoint perusahaan di halaman siswa
  const { loading, items } = useApplicants({ mode: 'mock' });
  const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
  // Hanya pakai hook API di page jika kita butuh debug info; tabel akan fetch sendiri kalau data tidak diberikan.
  const { status: apiStatus, error: apiError, data: apiItems, loading: apiLoading, usedToken, refetch } = useMyApplications();

  // read current logged-in siswa info from localStorage (reactively)
  const [currentUser, setCurrentUser] = useState<Record<string, any> | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("Berhasil");
  const [toastMsg, setToastMsg] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return setCurrentUser(null);
      setCurrentUser(JSON.parse(raw));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // determine source items: API-mode -> apiItems; otherwise use hook items (mock)
  const sourceItems = USE_API ? (apiItems ?? []) : (items ?? []);

  // if not using API, keep previous filtering by current user (mock mode may contain all applicants)
  const filtered = useMemo(() => {
    if (USE_API) return sourceItems; // backend already returns only the siswa's items
    if (!currentUser) return [];
    return (sourceItems || []).filter((a) => {
      const ap = a as any;
      // try matching by siswa id fields that backend might return
      const userId = currentUser.id ?? currentUser.siswa_id ?? currentUser.siswaId;
      const appSiswaId = ap.siswa_id ?? (ap.siswa && ap.siswa.id) ?? ap.siswaId;
      if (userId && appSiswaId) {
        if (String(appSiswaId) === String(userId)) return true;
      }
      // fallback by email
      if (currentUser.email && ap.email) {
        if (String(ap.email).toLowerCase() === String(currentUser.email).toLowerCase()) return true;
      }
      // fallback by nisn
      if (currentUser.nisn && ap.nisn) {
        if (String(ap.nisn) === String(currentUser.nisn)) return true;
      }
      return false;
    });
  }, [USE_API, currentUser, sourceItems]);

  const mapApplicant = (a: any) => ({
    id: String(a.id ?? a.pelamar_id ?? ""),
    posisi: a.posisi ?? a.posisi_name ?? a.posisiId ?? "-",
    perusahaan: (a.nama_perusahaan || a.perusahaan || a.perusahaan_nama || a.asalSekolah) ?? "-",
    penempatan: a.lokasi_penempatan || (a.alamat ? String(a.alamat).split(",")[0] : (a.penempatan ?? "-")),
    cvUrl: a.cvUrl ?? a.cv_url ?? null,
    transkripUrl: a.transkripUrl ?? a.transkrip_url ?? null,
    status: (a.status as any) || a.status_lamaran || "lamar",
  });

  // === Student actions: respond penawaran ===
  async function getSiswaToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    let token =
      localStorage.getItem("access_token_siswa") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token");
    if (!token) {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.access_token || parsed?.token || parsed?.accessToken || parsed?.auth_token || null;
        }
      } catch {}
    }
    return token;
  }

  async function respondPenawaran(id: string, aksi: "terima" | "tolak") {
    const token = await getSiswaToken();
    const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
    const opts: RequestInit = {
      method: "POST",
      headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
      credentials: token ? "omit" : "include",
      body: JSON.stringify({ aksi }),
    };
    const res = await fetch(`${BASE}/pelamar/${id}/respond-penawaran`, opts);
    if (!res.ok) {
      let userMsg = aksi === "terima" ? "Gagal menerima penawaran." : "Gagal menolak penawaran.";
      try {
        const ct = res.headers.get('Content-Type') || '';
        if (ct.includes('application/json')) {
          const body = await res.clone().json().catch(() => null);
          const apiMsg = body?.message || body?.error || null;
          if (apiMsg) userMsg = apiMsg;
        }
      } catch {}
      if (res.status === 401) userMsg = "Sesi Anda berakhir. Silakan login kembali.";
      if (res.status === 403) userMsg = "Anda tidak berhak melakukan aksi ini.";
      if (res.status === 409 && !/diterima|ditolak/i.test(userMsg)) userMsg = "Status lamaran sudah berubah. Silakan muat ulang.";
      throw new Error(userMsg);
    }
    // refresh siswa applications
    try { await refetch(); } catch {}
    setToastTitle("Berhasil");
    setToastMsg(aksi === "terima" ? "Penawaran berhasil diterima." : "Penawaran berhasil ditolak.");
    setToastOpen(true);
  }

  const handleAccept = async (id: string) => {
    try {
      await respondPenawaran(id, "terima");
    } catch (e: any) {
      setToastTitle("Gagal");
      setToastMsg(e?.message || String(e));
      setToastOpen(true);
    }
  };
  const handleReject = async (id: string) => {
    try {
      await respondPenawaran(id, "tolak");
    } catch (e: any) {
      setToastTitle("Gagal");
      setToastMsg(e?.message || String(e));
      setToastOpen(true);
    }
  };

  return (
    <div className="p-4">
      <h3 className="mb-4">Lowongan Dilamar</h3>
      {/* Debug panel: enable by adding ?debug=1 to the URL in the browser */}
      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1" && (
        <div className="mb-4 rounded-md border p-3 bg-yellow-50 text-sm text-gray-800">
          <div className="font-semibold">Debug info (temporary)</div>
          <div>currentUser: <pre className="whitespace-pre-wrap">{JSON.stringify(currentUser, null, 2)}</pre></div>
          <div>token present: {Boolean(localStorage.getItem("access_token_siswa") || localStorage.getItem("token")) ? "yes" : "no"}</div>
          <div>usedToken (debug): <pre className="whitespace-pre-wrap break-words">{usedToken ? String(usedToken).slice(0, 200) + (String(usedToken).length > 200 ? "..." : "") : "(none)"}</pre></div>
          <div>apiStatus: {String(apiStatus ?? "-")}</div>
          <div>apiError: <pre className="whitespace-pre-wrap text-red-600">{String(apiError ?? "-")}</pre></div>
          <div>apiItems (raw): <pre className="whitespace-pre-wrap">{JSON.stringify(apiItems, null, 2)}</pre></div>
          <div className="text-xs text-gray-600">Check Network tab for GET {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}/pelamar</div>
        </div>
      )}
      {USE_API ? (
        // Mode API: biarkan tabel melakukan fetch internal dan menampilkan skeleton & empty state sendiri
        <StudentApplicationsTable onAccept={handleAccept} onReject={handleReject} />
      ) : !currentUser ? (
        <div>Silakan login untuk melihat lamaran Anda.</div>
      ) : (
        // Mode mock: kirim data yang sudah difilter agar tabel tidak fetch API
        <StudentApplicationsTable data={filtered.map(mapApplicant)} onAccept={handleAccept} onReject={handleReject} />
      )}

      <SuccessModal
        open={toastOpen}
        title={toastTitle}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
        duration={1800}
      />
    </div>
  );
}
