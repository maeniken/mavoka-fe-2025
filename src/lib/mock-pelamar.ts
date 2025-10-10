// src/lib/pelamar.tsx
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getAuthToken } from "@/lib/authToken";
import type { BackendPelamarRecord } from "@/services/applicants";
import type {
  Applicant,
  ApplicantStatus,
  InterviewPayload,
  Position,
} from "@/types/pelamar";

/* =========================
   Toggle sumber data (mock vs API)
   Set .env: NEXT_PUBLIC_USE_API=true saat BE siap
========================= */
const USE_API = process.env.NEXT_PUBLIC_USE_API === "true";

/* =========================
   MOCK DATA (sementara)
========================= */
let _positions: Position[] = [
  { id: "p1", name: "Administrasi Perkantoran" },
  { id: "p2", name: "Desain Grafis" },
  { id: "p3", name: "Front-End Developer" },
];

let _applicants: Applicant[] = Array.from({ length: 24 }).map((_, i) => {
  const pos = _positions[i % _positions.length];
  const nama = i % 3 === 0 ? "Lisa Mariana" : i % 3 === 1 ? "Budi Setiawan" : "Siti Amalia";
  const email = i % 3 === 0 ? "lisa@gmail.com" : i % 3 === 1 ? "budi@gmail.com" : "siti@gmail.com";
  const status: ApplicantStatus = (["lamar", "wawancara", "penawaran", "ditolak"] as ApplicantStatus[])[i % 4];
  return {
    id: String(i + 1),
    nama,
    posisiId: pos.id,
    posisi: pos.name,
    asalSekolah: "SMKN 1 YOGYAKARTA",
    jurusan: "otomatisasi dan tata kelola perkantoran",
    email,
    cvUrl: "/files/sample-cv.pdf",
    transkripUrl: "/files/sample-transkrip.pdf",
    status,

     fotoUrl: undefined,
    nisn: `21356456${(i % 10)}`,
    noHp: "0821345566",
    alamat:
      "Jl. Melati No. 12, RT 04/RW 02, Kel. Ngupasan, Kec. Gondomanan, Kota Yogyakarta, DI Yogyakarta 55271",
  };
});

const _interviewNotes: Record<string, InterviewPayload> = {};

const mock = {
  async getPositions(): Promise<Position[]> {
    return JSON.parse(JSON.stringify(_positions));
  },
  async getApplicants(): Promise<Applicant[]> {
    return JSON.parse(JSON.stringify(_applicants));
  },
  async updateStatus(id: string, status: ApplicantStatus): Promise<Applicant | null> {
    const i = _applicants.findIndex((a) => a.id === id);
    if (i === -1) return null;
    _applicants[i].status = status;
    return JSON.parse(JSON.stringify(_applicants[i]));
  },
  async scheduleInterview(id: string, payload: InterviewPayload): Promise<Applicant | null> {
    const updated = await mock.updateStatus(id, "wawancara");
    if (!updated) return null;
    _interviewNotes[id] = payload;
    return updated;
  },
};

/* =========================
   API adapter (isi endpoint BE kamu di sini)
========================= */
const api = {
  async getPositions(): Promise<Position[]> {
    // If backend has positions endpoint adjust path. For now fallback empty.
    try {
      const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const r = await fetch(`${BASE}/positions`, { credentials: "include" });
      if (!r.ok) return [];
      return r.json();
    } catch {
      return [];
    }
  },
  async getApplicants(params: { page?: number; perPage?: number; posisiId?: string; status?: string }) {
    const { fetchApplicants } = await import("@/services/applicants");
    return await fetchApplicants({
      page: params.page,
      perPage: params.perPage,
      posisiId: params.posisiId,
      status: params.status,
    });
  },
  async updateStatus(id: string, status: ApplicantStatus): Promise<Applicant | null> {
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const url = `${BASE}/pelamar/${id}/status`;
    try {
      const token = getAuthToken();
      const r = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error(`Gagal update status: HTTP ${r.status}`);
      const b = await r.json().catch(() => ({}));
      const rec: BackendPelamarRecord | undefined = (b && (b.data || b)) as BackendPelamarRecord;
      if (rec && typeof rec === "object") return mapBackendToApplicant(rec);
      return null;
    } catch (e) {
      console.error("updateStatus API error", e);
      return null;
    }
  },
  async scheduleInterview(id: string, payload: InterviewPayload): Promise<Applicant | null> {
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const url = `${BASE}/perusahaan/pelamar/${id}/interview`;
    try {
      const token = getAuthToken();
      const r = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          zoom_link: payload.zoomLink,
          waktu_text: payload.waktuText,
          tanggal_iso: payload.tanggalISO,
        }),
      });
      if (!r.ok) throw new Error(`Gagal jadwalkan interview: HTTP ${r.status}`);
      const b = await r.json().catch(() => ({}));
      const rec: BackendPelamarRecord | undefined = (b && (b.data || b)) as BackendPelamarRecord;
      if (rec && typeof rec === "object") return mapBackendToApplicant(rec);
      return null;
    } catch (e) {
      console.error("scheduleInterview API error", e);
      return null;
    }
  },
};

const ds = USE_API ? api : mock;

/* =========================
   Hook utama + sorting aturan khusus
========================= */
export function useApplicants(opts?: { mode?: 'auto' | 'api' | 'mock' }) {
  const mode = opts?.mode ?? 'auto';
  const USE_API_EFF = mode === 'auto' ? USE_API : mode === 'api';
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Server-side pagination meta (API mode)
  const [apiMeta, setApiMeta] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  } | null>(null);

  // filter & paging
  const [posisiId, setPosisiId] = useState("");
  const [status, setStatus] = useState<ApplicantStatus | "">("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // urutan stabil per grup status
  const [orderSeq, setOrderSeq] = useState<Record<string, number>>({});
  const [seqCounter, setSeqCounter] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_API_EFF) {
        const appsRes: any = await api.getApplicants({ page, perPage, posisiId, status: status || undefined });
        const raw = Array.isArray(appsRes?.data) ? appsRes.data : [];
        setApiMeta(appsRes?.pagination ?? null);
        // Map backend shape to Applicant
        const mapped: Applicant[] = raw.map((it: any) => ({
          id: String(it.id),
          nama: it.siswa?.nama_lengkap ?? "-",
          posisiId: String(it.lowongan?.id ?? ""),
          posisi: it.lowongan?.posisi ?? "-",
          asalSekolah: it.siswa?.asal_sekolah ?? "-",
          jurusan: it.siswa?.jurusan ?? "-",
          email: it.siswa?.email ?? "-",
          cvUrl: it.cv_url ?? undefined,
          transkripUrl: it.transkrip_url ?? undefined,
          status: (it.status_lamaran ?? "lamar") as Applicant["status"],
          fotoUrl: it.siswa?.foto_url ?? undefined,
          nisn: it.siswa?.nisn ?? undefined,
          noHp: it.siswa?.no_hp ?? undefined,
          alamat: it.siswa?.alamat ?? undefined,
        }));

        setAllApplicants(mapped);
        setOrderSeq(Object.fromEntries(mapped.map((a, i) => [a.id, i])));
        setSeqCounter(mapped.length);

        // Derive positions from API result unique by lowongan.id
        const posMap = new Map<string, string>();
        for (const it of raw) {
          const pid = String(it.lowongan?.id ?? "");
          const pnm = it.lowongan?.posisi ?? "";
          if (pid && pnm && !posMap.has(pid)) posMap.set(pid, pnm);
        }
        setPositions(Array.from(posMap, ([id, name]) => ({ id, name })));
      } else {
        const [pos, apps] = await Promise.all([
          (async () => { try { return await mock.getPositions(); } catch { return []; } })(),
          (async () => { try { return await (mock as any).getApplicants(); } catch { return []; } })(),
        ]);
        setPositions(pos);
        setAllApplicants(apps as Applicant[]);
        setOrderSeq(Object.fromEntries((apps as Applicant[]).map((a, i) => [a.id, i])));
        setSeqCounter((apps as Applicant[]).length);
        setApiMeta(null);
      }
    } catch (e: any) {
      console.error("Failed loading applicants", e);
      setError(e.message || "Gagal memuat data");
      setAllApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, posisiId, status, USE_API_EFF]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusRank: Record<ApplicantStatus, number> = {
    lamar: 0,
    wawancara: 1,
    penawaran: 2,
    diterima: 3,
    ditolak: 4,
  };

  // sort: grup status (lamar→wawancara→diterima→ditolak), dalam grup pakai orderSeq
  const sortedAll = useMemo(() => {
    return [...allApplicants].sort((a, b) => {
      const r = statusRank[a.status] - statusRank[b.status];
      if (r !== 0) return r;
      return (orderSeq[a.id] ?? 0) - (orderSeq[b.id] ?? 0);
    });
  }, [allApplicants, orderSeq]);

  // filter di atas hasil sorting
  const filtered = useMemo(
    () => sortedAll.filter((a) => (!posisiId || a.posisiId === posisiId) && (!status || a.status === status)),
    [sortedAll, posisiId, status]
  );

  // Pagination figures
  const total = USE_API_EFF ? apiMeta?.total : filtered.length;
  // If posisiId filter aktif, kita tidak punya total server untuk filter itu.
  // Sementara: jika posisiId aktif, gunakan perhitungan lokal pada halaman saat ini.
  const effectiveTotalPages = useMemo(() => {
    if (!USE_API) return Math.max(1, Math.ceil((total ?? 0) / perPage));
    if (posisiId) {
      // client-side only view for current page
      return 1;
    }
    return Math.max(1, apiMeta?.last_page ?? 1);
  }, [USE_API_EFF, total, perPage, apiMeta, posisiId]);
  // Page index bounded by available pages
  const pageSafe = Math.min(page, effectiveTotalPages);

  const items = useMemo(() => {
    if (USE_API_EFF) return filtered; // API already paginated (filtered may reduce count visually)
    const start = (pageSafe - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, pageSafe, perPage]);

  // helper untuk menaruh item "paling bawah" di grup barunya
  function bumpToBottom(id: string) {
    setOrderSeq((prev) => ({ ...prev, [id]: seqCounter + 1 }));
    setSeqCounter((c) => c + 1);
  }

  // actions
  async function onInterview(id: string, payload: InterviewPayload) {
  const DS = USE_API_EFF ? api : mock;
  const updated = await DS.scheduleInterview(id, payload);
    if (updated) {
      setAllApplicants((prev) => prev.map((a) => (a.id === id ? mergeApplicant(a, updated) : a)));
      bumpToBottom(id);
    } else if (USE_API_EFF) {
      // Jika API tidak mengembalikan record, lakukan refresh agar status ikut terbarui dari server
      await loadData();
    }
  }
  async function onAccept(id: string) {
    // Cari current status untuk menentukan transisi yang benar
    const current = allApplicants.find(a => a.id === id)?.status;
    let target: ApplicantStatus = "diterima";
    if (current === "wawancara") target = "penawaran"; // perusahaan mengajukan penawaran dulu
    else if (current === "penawaran") {
      // Setelah penawaran, keputusan ada pada pelamar.
      // Tidak melakukan update status dari sisi perusahaan.
      return;
    }
    const DS = USE_API_EFF ? api : mock;
    const updated = await DS.updateStatus(id, target);
    if (updated) {
      setAllApplicants((prev) => prev.map((a) => (a.id === id ? mergeApplicant(a, updated) : a)));
      bumpToBottom(id);
    } else if (USE_API_EFF) {
      await loadData();
    }
  }
  async function onReject(id: string) {
    // Penolakan dari wawancara atau penawaran sama-sama ke ditolak
    const DS = USE_API_EFF ? api : mock;
    const updated = await DS.updateStatus(id, "ditolak");
    if (updated) {
      setAllApplicants((prev) => prev.map((a) => (a.id === id ? mergeApplicant(a, updated) : a)));
      bumpToBottom(id);
    } else if (USE_API_EFF) {
      await loadData();
    }
  }

  return {
  loading,
  error,
    positions,
    items,
  total,
  page: USE_API_EFF && !posisiId ? (apiMeta?.current_page ?? pageSafe) : pageSafe,
    perPage,
  totalPages: effectiveTotalPages,
    setPage,
    setPerPage,
    posisiId,
    status,
    setFilterPosisi: (id: string) => {
      setPosisiId(id);
      setPage(1);
    },
    setFilterStatus: (s: ApplicantStatus | "") => {
      setStatus(s);
      setPage(1);
    },
    onInterview,
    onAccept,
    onReject,
    reload: loadData,
  };
}

// Helper untuk mapping BackendPelamarRecord -> Applicant konsisten dengan loadData()
function mapBackendToApplicant(it: BackendPelamarRecord): Applicant {
  return {
    id: String(it.id),
    nama: it.siswa?.nama_lengkap ?? "-",
    posisiId: String(it.lowongan?.id ?? ""),
    posisi: it.lowongan?.posisi ?? "-",
    asalSekolah: it.siswa?.asal_sekolah ?? "-",
    jurusan: it.siswa?.jurusan ?? "-",
    email: it.siswa?.email ?? "-",
    cvUrl: it.cv_url ?? undefined,
    transkripUrl: it.transkrip_url ?? undefined,
    status: (it.status_lamaran ?? "lamar") as Applicant["status"],
    fotoUrl: it.siswa?.foto_url ?? undefined,
    nisn: it.siswa?.nisn ?? undefined,
    noHp: it.siswa?.no_hp ?? undefined,
    alamat: it.siswa?.alamat ?? undefined,
  };
}

// Merge helper: keep existing non-empty fields if API returns partial/minimal payload
function mergeApplicant(prev: Applicant, next: Applicant): Applicant {
  const empty = (v: any) => v === undefined || v === null || v === '' || v === '-';
  return {
    id: prev.id,
    nama: empty(next.nama) ? prev.nama : next.nama,
    posisiId: empty(next.posisiId) ? prev.posisiId : next.posisiId,
    posisi: empty(next.posisi) ? prev.posisi : next.posisi,
    asalSekolah: empty(next.asalSekolah) ? prev.asalSekolah : next.asalSekolah,
    jurusan: empty(next.jurusan) ? prev.jurusan : next.jurusan,
    email: empty(next.email) ? prev.email : next.email,
    cvUrl: next.cvUrl ?? prev.cvUrl,
    transkripUrl: next.transkripUrl ?? prev.transkripUrl,
    status: next.status ?? prev.status,
    fotoUrl: next.fotoUrl ?? prev.fotoUrl,
    nisn: next.nisn ?? prev.nisn,
    noHp: next.noHp ?? prev.noHp,
    alamat: next.alamat ?? prev.alamat,
  };
}

/* =========================
   Helpers untuk halaman detail
========================= */
export async function fetchApplicantById(id: string) {
  if (USE_API) {
    const res = await api.getApplicants({ page: 1, perPage: 100 });
    const arr: Applicant[] = Array.isArray((res as any).data) ? (res as any).data : [];
    return arr.find((a: Applicant) => a.id === id) ?? null;
  } else {
    const list = await mock.getApplicants();
    return list.find((a) => a.id === id) ?? null;
  }
}

export async function updateApplicantStatus(id: string, status: ApplicantStatus) {
  const res = await (USE_API ? api.updateStatus(id, status) : mock.updateStatus(id, status));
  return res;
}
