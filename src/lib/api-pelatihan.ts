"use client";
import axios from "axios";
import { PelatihanFormValues, Pelatihan, Batch } from "@/types/pelatihan";

const API_ROOT =
  `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}`.replace(/\/+$/, "") + "/api";

const api = axios.create({ baseURL: API_ROOT });

function requireLPKAuthHeader() {
  if (typeof window === "undefined") {
    throw new Error("requireLPKAuthHeader hanya boleh dipanggil di client.");
  }
  const token =
    localStorage.getItem("access_token_lpk") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) throw new Error("Token LPK tidak ditemukan. Silakan login sebagai LPK.");
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
}

type CreateOrUpdateOpts = { publish?: boolean };

function computeBatchStatus(b: { start?: string; end?: string }) {
  const end = b.end ? new Date(b.end) : null;
  if (end && end.getTime() < Date.now()) return "selesai";
  return "sedang_berjalan";
}

function toApiPayload(v: PelatihanFormValues, opts?: CreateOrUpdateOpts) {
  const capaianArr = (v.capaian || []).map((s) => s.trim()).filter(Boolean);
  const payload: any = {
    nama_pelatihan: v.namaPelatihan,
    deskripsi: v.deskripsi,
    kategori: v.kategori || null,
    capaian_pembelajaran: JSON.stringify(capaianArr),
    detail: null,
  };
  if (opts?.publish === true) payload.history_batch = [];
  return payload;
}

function fromApiRow(row: any): Pelatihan {
  let capaianStr = "";
  try {
    const parsed = JSON.parse(row.capaian_pembelajaran ?? "[]");
    capaianStr = Array.isArray(parsed) ? parsed.join("; ") : String(row.capaian_pembelajaran ?? "");
  } catch {
    capaianStr = String(row.capaian_pembelajaran ?? "");
  }

  const batches: Batch[] = Array.isArray(row.batches)
    ? row.batches.map((b: any, i: number) => ({
        id: Number(b.id ?? i),
        name: b.name ?? b.nama ?? `Batch ${i + 1}`,
        start: b.start ?? b.mulai ?? b.start_date ?? null,
        end: b.end ?? b.selesai ?? b.end_date ?? null,
        status: computeBatchStatus({
          start: b.start ?? b.mulai ?? b.start_date,
          end: b.end ?? b.selesai ?? b.end_date,
        }),
      }))
    : [];

  return {
    id: Number(row.id),
    namaPelatihan: row.nama_pelatihan ?? "",
    deskripsi: row.deskripsi ?? "",
    kategori: row.kategori ?? "",
    capaian: capaianStr,
    batches,
    historyBatch: row.history_batch ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createPelatihan(values: PelatihanFormValues, opts?: CreateOrUpdateOpts) {
  const headers = requireLPKAuthHeader();
  const payload = toApiPayload(values, opts);
  const { data } = await api.post(`/pelatihan/create`, payload, { headers });
  return data;
}

export async function getPelatihanSaya(): Promise<Pelatihan[]> {
  const headers = requireLPKAuthHeader();
  const { data } = await api.get(`/pelatihan/mine`, { headers });
  const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return arr.map(fromApiRow);
}

export async function updatePelatihan(
  id: number,
  values: PelatihanFormValues,
  opts?: CreateOrUpdateOpts
) {
  const headers = requireLPKAuthHeader();
  const payload = toApiPayload(values, opts);
  const { data } = await api.put(`/pelatihan/update/${id}`, payload, { headers });
  return data;
}

export async function deletePelatihan(id: number) {
  const headers = requireLPKAuthHeader();
  const { data } = await api.delete(`/pelatihan/delete/${id}`, { headers });
  return data;
}

function fromApiBatch(b: any, index = 0): Batch {
  const start = b.start ?? b.mulai ?? b.start_date ?? null;
  const end = b.end ?? b.selesai ?? b.end_date ?? null;
  return {
    id: Number(b.id ?? index),
    name: b.name ?? b.nama_batch ?? b.nama ?? `Batch ${index + 1}`,
    start,
    end,
    status: (b.status as any) || computeBatchStatus({ start, end }),
  };
}

export async function createBatch(
  pelatihanId: number,
  input: { name: string; start?: string | null; end?: string | null; status?: string | null }
): Promise<Batch> {
  const headers = requireLPKAuthHeader();
  const payload = {
    nama_batch: input.name,
    mulai: input.start ?? null,
    selesai: input.end ?? null,
    ...(input.status ? { status: input.status } : {}),
  } as any;
  const { data } = await api.post(`/pelatihan/${pelatihanId}/batch`, payload, { headers });
  const row = data?.data ?? data;
  return fromApiBatch(row);
}
