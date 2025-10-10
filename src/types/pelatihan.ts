export type BatchStatus = "sedang_berjalan" | "selesai";

export type Batch = {
  id?: number;
  name: string;
  start: string | null;
  end: string | null;
  status?: BatchStatus;
};

export type Pelatihan = {
  id: number;
  namaPelatihan: string;
  deskripsi: string;
  kategori: string;
  capaian: string;
  capaianList?: string[];
  batches?: Batch[];
  historyBatch?: any[] | null; // <— penanda draft/terpasang FE-only
  createdAt?: string;
  updatedAt?: string;
};

export type PelatihanFormValues = {
  namaPelatihan: string;
  deskripsi: string;
  kategori: string;
  capaian: string[];
};
