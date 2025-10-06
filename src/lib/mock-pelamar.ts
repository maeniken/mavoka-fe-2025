// src/lib/pelamar.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
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
  const status: ApplicantStatus = (["lamar", "wawancara", "diterima", "ditolak"] as ApplicantStatus[])[i % 4];
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
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    const r = await fetch(`${BASE}/positions`, { credentials: "include" });
    if (!r.ok) throw new Error("Failed to fetch positions");
    return r.json();
  },
  async getApplicants(): Promise<Applicant[]> {
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
    // call the new endpoint that returns only the current siswa's applications
    const r = await fetch(`${BASE}/pelamar`, { credentials: "include" });
    if (!r.ok) throw new Error("Failed to fetch applicants");
    const body = await r.json();
    // backend returns { status: 'success', data: [...] }
    if (body && body.data) return body.data as Applicant[];
    // fallback if backend returns array directly
    return body as Applicant[];
  },
  async updateStatus(id: string, status: ApplicantStatus): Promise<Applicant | null> {
    const r = await fetch(`/api/applicants/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (!r.ok) return null;
    return r.json();
  },
  async scheduleInterview(id: string, payload: InterviewPayload): Promise<Applicant | null> {
    const r = await fetch(`/api/applicants/${id}/interview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!r.ok) return null;
    return r.json();
  },
};

const ds = USE_API ? api : mock;

/* =========================
   Hook utama + sorting aturan khusus
========================= */
export function useApplicants() {
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // filter & paging
  const [posisiId, setPosisiId] = useState("");
  const [status, setStatus] = useState<ApplicantStatus | "">("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // urutan stabil per grup status
  const [orderSeq, setOrderSeq] = useState<Record<string, number>>({});
  const [seqCounter, setSeqCounter] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pos, apps] = await Promise.all([
          (async () => {
            try { return await ds.getPositions(); } catch (e) { console.warn("getPositions failed", e); return []; }
          })(),
          (async () => {
            try { return await ds.getApplicants(); } catch (e) { console.warn("getApplicants failed", e); return []; }
          })(),
        ]);
        setPositions(pos);
        setAllApplicants(apps);
        setOrderSeq(Object.fromEntries(apps.map((a, i) => [a.id, i]))); // urutan awal = urutan datang
        setSeqCounter(apps.length);
      } catch (e) {
        console.error("Failed initializing applicants dataset", e);
        setPositions([]);
        setAllApplicants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusRank: Record<ApplicantStatus, number> = {
    lamar: 0,
    wawancara: 1,
    diterima: 2,
    ditolak: 3,
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

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageSafe = Math.min(page, totalPages);
  const items = useMemo(() => {
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
    const updated = await ds.scheduleInterview(id, payload);
    if (!updated) return;
    setAllApplicants((prev) => prev.map((a) => (a.id === id ? updated : a)));
    bumpToBottom(id);
  }
  async function onAccept(id: string) {
    const updated = await ds.updateStatus(id, "diterima");
    if (!updated) return;
    setAllApplicants((prev) => prev.map((a) => (a.id === id ? updated : a)));
    bumpToBottom(id);
  }
  async function onReject(id: string) {
    const updated = await ds.updateStatus(id, "ditolak");
    if (!updated) return;
    setAllApplicants((prev) => prev.map((a) => (a.id === id ? updated : a)));
    bumpToBottom(id);
  }

  return {
    loading,
    positions,
    items,
    total,
    page: pageSafe,
    perPage,
    totalPages,
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
  };
}

/* =========================
   Helpers untuk halaman detail
========================= */
export async function fetchApplicantById(id: string) {
  const list = await (USE_API ? api.getApplicants() : mock.getApplicants());
  return list.find((a) => a.id === id) ?? null;
}

export async function updateApplicantStatus(id: string, status: ApplicantStatus) {
  const res = await (USE_API ? api.updateStatus(id, status) : mock.updateStatus(id, status));
  return res;
}
