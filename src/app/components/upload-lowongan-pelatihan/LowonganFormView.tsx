"use client";

import { useMemo, useState, ChangeEvent, FormEvent, useEffect } from "react";
import { usePathname } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";
import type { Lowongan, CreateLowonganPayload } from "@/types/lowongan";

export type LowonganFormMode = "create" | "edit-draft" | "edit-terpasang" | "detail";
type ActionType = "draft" | "unggah" | "save";

type Props = {
  mode: LowonganFormMode;
  initial?: Partial<Lowongan>;
  onBack?: () => void;

  onSaveDraft?: (payload: CreateLowonganPayload, id?: number) => void | Promise<void>;
  onUnggah?: (payload: CreateLowonganPayload, id?: number) => void | Promise<void>;
  onSave?: (payload: CreateLowonganPayload, id?: number) => void | Promise<void>;

  /** aksi mana yang perlu menampilkan popup sukses */
  successFor?: ActionType[];
  /** pesan default (fallback) jika successMessageDraft/ Unggah tidak diberikan */
  successMessage?: string;
  /** pesan khusus ketika klik “Simpan Draft” */
  successMessageDraft?: string;
  /** pesan khusus ketika klik “Unggah” */
  successMessageUnggah?: string;

  /** dipanggil setelah popup sukses ditutup */
  onSuccessClose?: (action: ActionType) => void;
};

const textToArray = (s: string) => s.split(/\r?\n|;/).map((x) => x.trim()).filter(Boolean);
const arrayToText = (arr?: string[]) => (arr && arr.length ? arr.join("\n") : "");

const emptyForm = {
  posisi: "",
  deskripsi: "",
  kuota: "",
  deadline_lamaran: "",
  mulaiMagang: "",
  selesaiMagang: "",
  lokasi_penempatan: "",
  tugas: "",
  persyaratan: "",
  keuntungan: "",
};

export default function LowonganFormView({
  mode,
  initial,
  onBack,
  onSaveDraft,
  onUnggah,
  onSave,
  successFor = [],
  successMessage,
  successMessageDraft,
  successMessageUnggah,
  onSuccessClose,
}: Props) {
  const pathname = usePathname();

  // pastikan mode konsisten berdasar URL
  const effectiveMode: LowonganFormMode = useMemo(() => {
    if (pathname?.includes("/upload-lowongan/edit/draft/")) return "edit-draft";
    if (pathname?.includes("/upload-lowongan/edit/terpasang/")) return "edit-terpasang";
    if (pathname?.includes("/upload-lowongan/detail/")) return "detail";
    return mode;
  }, [pathname, mode]);

  useEffect(() => {
    console.log("[LowonganFormView] mode =", mode, "effective =", effectiveMode, "path =", pathname);
  }, [mode, effectiveMode, pathname]);

  const [form, setForm] = useState({
    posisi: initial?.posisi ?? emptyForm.posisi,
    deskripsi: initial?.deskripsi ?? emptyForm.deskripsi,
    kuota: String(initial?.kuota ?? emptyForm.kuota),
    deadline_lamaran: initial?.deadline_lamaran ?? emptyForm.deadline_lamaran,
    mulaiMagang: initial?.mulaiMagang ?? emptyForm.mulaiMagang,
    selesaiMagang: initial?.selesaiMagang ?? emptyForm.selesaiMagang,
    lokasi_penempatan: initial?.lokasi_penempatan ?? emptyForm.lokasi_penempatan,
    tugas: arrayToText(initial?.tugas),
    persyaratan: arrayToText(initial?.persyaratan),
    keuntungan: arrayToText(initial?.keuntungan),
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);
  const [submitting, setSubmitting] = useState<ActionType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof emptyForm, string>>>({});

  const readOnly = effectiveMode === "detail";
  const canShowDraft = effectiveMode === "create" || effectiveMode === "edit-draft";
  const canShowUnggah = effectiveMode === "create" || effectiveMode === "edit-draft";
  const canShowSimpan = effectiveMode === "edit-terpasang";

  function onChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change if now valid
    const key = name as keyof typeof emptyForm;
    setErrors((prev) => {
      if (!(key in prev)) return prev;

      const next = { ...prev };
      const isValid = (() => {
        if (key === "kuota") return !!value && Number(value) > 0;
        if (key === "tugas" || key === "persyaratan" || key === "keuntungan") return textToArray(value).length > 0;
        return !!String(value).trim();
      })();
      if (isValid) delete next[key];
      return next;
    });
  }

  // Validate all fields required
  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof emptyForm, string>> = {};
    if (!form.posisi.trim()) newErrors.posisi = "Wajib diisi.";
    if (!form.deskripsi.trim()) newErrors.deskripsi = "Wajib diisi.";
    if (!form.kuota || Number(form.kuota) <= 0) newErrors.kuota = "Wajib diisi.";
    if (!form.deadline_lamaran) newErrors.deadline_lamaran = "Wajib diisi.";
    if (!form.mulaiMagang) newErrors.mulaiMagang = "Wajib diisi.";
    if (!form.selesaiMagang) newErrors.selesaiMagang = "Wajib diisi.";
    if (!form.lokasi_penempatan.trim()) newErrors.lokasi_penempatan = "Wajib diisi.";
    if (textToArray(form.tugas).length === 0) newErrors.tugas = "Wajib diisi.";
    if (textToArray(form.persyaratan).length === 0) newErrors.persyaratan = "Wajib diisi.";
    if (textToArray(form.keuntungan).length === 0) newErrors.keuntungan = "Wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): CreateLowonganPayload => ({
    perusahaan_id: initial?.perusahaan_id ?? 0,
    judul_lowongan: form.posisi.trim(),
    posisi: form.posisi.trim(),
    deskripsi: form.deskripsi.trim(),
    kuota: Number(form.kuota || 0),
    lokasi_penempatan: form.lokasi_penempatan.trim(),
    deadline_lamaran: form.deadline_lamaran,
    mulaiMagang: form.mulaiMagang,
    selesaiMagang: form.selesaiMagang,
    tugas: textToArray(form.tugas),
    persyaratan: textToArray(form.persyaratan),
    keuntungan: textToArray(form.keuntungan),
  });

  const getSuccessMessage = (action: ActionType) => {
    if (action === "draft") return successMessageDraft ?? successMessage ?? "Perubahan berhasil disimpan.";
    if (action === "unggah") return successMessageUnggah ?? successMessage ?? "Perubahan berhasil disimpan.";
    return successMessage ?? "Perubahan berhasil disimpan.";
  };

  const trigger = async (action: ActionType, fn?: (p: CreateLowonganPayload, id?: number) => void | Promise<void>) => {
    setErrorMsg(null);
    // prevent submit when invalid
    const ok = validateForm();
    if (!ok) {
      setErrorMsg("Harap lengkapi semua field yang wajib diisi.");
      return;
    }
    const payload = buildPayload();
    const id = typeof initial?.id === "number" ? initial.id : undefined;
    try {
      setSubmitting(action);
      await fn?.(payload, id);
      setLastAction(action);
      const msg = getSuccessMessage(action);
      if (successFor.includes(action) && msg) {
        setSuccessText(msg);
        setShowSuccess(true);
      }
    } catch (e: any) {
      const apiMsg = e?.response?.data?.message || e?.message;
      setErrorMsg(apiMsg ? String(apiMsg) : "Gagal menyimpan perubahan.");
    } finally {
      setSubmitting(null);
    }
  };

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const subtitle = "Pastikan informasi data lowongan terisi dengan benar.";

  // Style input sesuai spek
  const inputBase =
    "mt-1 w-full rounded border px-3 py-2 text-sm disabled:bg-gray-100 " +
    "placeholder-[#858585] text-black border-[#B7B7B7] focus:border-[#0F67B1] focus:outline-none";

  const inputClass = (field: keyof typeof emptyForm) =>
    `${inputBase} ${errors[field] ? "!border-red-500 focus:!border-red-600" : ""}`;

  const footerButtons = useMemo(() => {
    if (readOnly) return null;
    return (
      <div className="flex justify-end gap-2 mt-6">
        {canShowDraft && (
          <button
            type="button"
            onClick={() => trigger("draft", onSaveDraft)}
            disabled={!!submitting}
            className={`border border-[#0F67B1] bg-white text-[#0F67B1] px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {submitting === "draft" ? "Menyimpan…" : "Simpan Draft"}
          </button>
        )}

        {canShowSimpan && (
          <button
            type="button"
            onClick={() => trigger("save", onSave)}
            disabled={!!submitting}
            className={`border border-[#0F67B1] bg-white text-[#0F67B1] px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {submitting === "save" ? "Menyimpan…" : "Simpan"}
          </button>
        )}

        {canShowUnggah && (
          <button
            type="button"
            onClick={() => trigger("unggah", onUnggah)}
            disabled={!!submitting}
            className={`bg-[#0F67B1] text-white px-4 py-2 rounded hover:bg-[#0c599b] disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {submitting === "unggah" ? "Mengunggah…" : "Unggah"}
          </button>
        )}
      </div>
    );
  }, [
    readOnly,
    canShowDraft,
    canShowUnggah,
    canShowSimpan,
    onSaveDraft,
    onUnggah,
    onSave,
    successFor,
    successMessage,
    successMessageDraft,
    successMessageUnggah,
    form,
    submitting,
  ]);

  return (
    <div className="w-full">
      <button
        onClick={onBack ?? (() => history.back())}
        className="flex items-center gap-1 text-xl font-semibold mb-4 py-0 px-0 shadow-none bg-none"
      >
        <IoArrowBack className="text-xl" />
        Kembali
      </button>

      <div className="w-full bg-white p-5 rounded-lg">
        <h3 className="font-semibold text-lg mb-1">Data Lowongan</h3>
        <p className="mb-6 text-sm text-gray-600">{subtitle}</p>
        <hr className="border-t border-gray-300 mb-6" />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold">Posisi</label>
            <input
              type="text"
              name="posisi"
              value={form.posisi}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan posisi..."
              className={inputClass("posisi")}
            />
            {errors.posisi && <p className="text-xs text-red-600 mt-1">{errors.posisi}</p>}
          </div>

          <div>
            <label className="block font-semibold">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan Deskripsi..."
              rows={4}
              className={inputClass("deskripsi")}
            />
            {errors.deskripsi && <p className="text-xs text-red-600 mt-1">{errors.deskripsi}</p>}
          </div>

          <div>
            <label className="block font-semibold">Jumlah Kuota</label>
            <input
              type="number"
              name="kuota"
              value={form.kuota}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan kuota..."
              className={inputClass("kuota")}
            />
            {errors.kuota && <p className="text-xs text-red-600 mt-1">{errors.kuota}</p>}
          </div>

          <div>
            <label className="block font-semibold">Tanggal Penutupan Lowongan</label>
            <input
              type="date"
              name="deadline_lamaran"
              value={form.deadline_lamaran}
              onChange={onChange}
              readOnly={readOnly}
              className={inputClass("deadline_lamaran")}
            />
            {errors.deadline_lamaran && <p className="text-xs text-red-600 mt-1">{errors.deadline_lamaran}</p>}
          </div>

          <div>
            <label className="block font-semibold">Periode Mulai Magang</label>
            <input
              type="date"
              name="mulaiMagang"
              value={form.mulaiMagang}
              onChange={onChange}
              readOnly={readOnly}
              className={inputClass("mulaiMagang")}
            />
            {errors.mulaiMagang && <p className="text-xs text-red-600 mt-1">{errors.mulaiMagang}</p>}
          </div>

          <div>
            <label className="block font-semibold">Periode Selesai Magang</label>
            <input
              type="date"
              name="selesaiMagang"
              value={form.selesaiMagang}
              onChange={onChange}
              readOnly={readOnly}
              className={inputClass("selesaiMagang")}
            />
            {errors.selesaiMagang && <p className="text-xs text-red-600 mt-1">{errors.selesaiMagang}</p>}
          </div>

          <div>
            <label className="block font-semibold">Lokasi Penempatan</label>
            <input
              type="text"
              name="lokasi_penempatan"
              value={form.lokasi_penempatan}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan lokasi penempatan..."
              className={inputClass("lokasi_penempatan")}
            />
            {errors.lokasi_penempatan && <p className="text-xs text-red-600 mt-1">{errors.lokasi_penempatan}</p>}
          </div>

          <div>
            <label className="block font-semibold">Tugas & Tanggung Jawab</label>
            <textarea
              name="tugas"
              value={form.tugas}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan tugas dan tanggungjawab... (pisahkan baris/semicolon)"
              rows={4}
              className={inputClass("tugas")}
            />
            {errors.tugas && <p className="text-xs text-red-600 mt-1">{errors.tugas}</p>}
          </div>

          <div>
            <label className="block font-semibold">Persyaratan</label>
            <textarea
              name="persyaratan"
              value={form.persyaratan}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan persyaratan... (pisahkan baris/semicolon)"
              rows={4}
              className={inputClass("persyaratan")}
            />
            {errors.persyaratan && <p className="text-xs text-red-600 mt-1">{errors.persyaratan}</p>}
          </div>

          <div>
            <label className="block font-semibold">Keuntungan</label>
            <textarea
              name="keuntungan"
              value={form.keuntungan}
              onChange={onChange}
              readOnly={readOnly}
              placeholder="Masukkan keuntungan... (pisahkan baris/semicolon)"
              rows={4}
              className={inputClass("keuntungan")}
            />
            {errors.keuntungan && <p className="text-xs text-red-600 mt-1">{errors.keuntungan}</p>}
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 mt-2">{errorMsg}</p>
          )}

          {footerButtons}
        </form>
      </div>

      <SuccessModal
        open={showSuccess}
        title="Berhasil"
        message={successText ?? successMessage ?? "Perubahan berhasil disimpan"}
        onClose={() => {
          setShowSuccess(false);
          if (lastAction) onSuccessClose?.(lastAction);
        }}
      />
    </div>
  );
}
