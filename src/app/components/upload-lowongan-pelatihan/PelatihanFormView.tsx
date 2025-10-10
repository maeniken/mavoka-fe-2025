"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { BsTrash } from "react-icons/bs";
import { PelatihanFormValues } from "@/types/pelatihan";

type Mode = "create" | "detail" | "editDraft" | "editPublished";

type Props = {
  mode: Mode;
  title?: string;
  initial?: Partial<PelatihanFormValues>;
  onSaveDraft?: (v: PelatihanFormValues) => void | Promise<void>;
  onPublish?: (v: PelatihanFormValues) => void | Promise<void>;
  onSave?: (v: PelatihanFormValues) => void | Promise<void>;
};

export default function PelatihanFormView({
  mode,
  title,
  initial,
  onSaveDraft,
  onPublish,
  onSave,
}: Props) {
  const router = useRouter();
  const readOnly = mode === "detail";

  const [values, setValues] = useState<PelatihanFormValues>({
    namaPelatihan: initial?.namaPelatihan || "",
    deskripsi: initial?.deskripsi || "",
    kategori: initial?.kategori || "",
    capaian: initial?.capaian?.length ? [...initial.capaian] : [""],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittingAction, setSubmittingAction] = useState<"draft" | "publish" | "save" | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const setField =
    (k: keyof PelatihanFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  const setCapaian = (i: number, val: string) =>
    setValues((v) => {
      const next = [...v.capaian];
      next[i] = val;
      return { ...v, capaian: next };
    });

  const addCapaian = () =>
    setValues((v) => ({ ...v, capaian: [...v.capaian, ""] }));

  const removeCapaian = (i: number) =>
    setValues((v) => {
      if (!Array.isArray(v.capaian) || v.capaian.length <= 1) {
        return { ...v, capaian: [""] };
      }
      const next = v.capaian.filter((_, idx) => idx !== i);
      return { ...v, capaian: next.length ? next : [""] };
    });

  const canSubmit =
    values.namaPelatihan.trim() &&
    values.deskripsi.trim() &&
    values.kategori.trim() &&
    values.capaian.some((c) => c.trim());

  const defaultTitle =
    mode === "create"
      ? "Unggah Pelatihan Magang"
      : mode === "editDraft"
      ? "Ubah Draft Pelatihan"
      : mode === "editPublished"
      ? "Ubah Data Pelatihan"
      : "Detail Data Pelatihan";

  const fieldCls = (extra = "") =>
    [
      "w-full rounded-lg border border-gray-300 text-[#858585] p-4",
      readOnly ? "bg-gray-100 text-[#858585]" : "",
      !readOnly &&
        "focus:outline-none focus:ring-2 focus:ring-[#0F67B1] focus:border-[#0F67B1]",
      extra,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-black hover:opacity-80 shadow-none mb-0"
        >
          <FiArrowLeft className="-ml-4" />
          <span className="text-xl font-semibold leading-none">Kembali</span>
        </button>

        <h3 className="font-semibold leading-tight mt-3">
          {title || defaultTitle}
        </h3>
      </div>

      <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm ">
        {status && (
          <div
            className={`mb-4 rounded-md border px-3 py-2 text-sm ${
              status.type === 'success'
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-red-300 bg-red-50 text-red-700'
            }`}
            role="alert"
          >
            {status.message}
          </div>
        )}
        <div className="mb-4">
          <h3 className="font-bold">Data Pelatihan</h3>
          <p className="text-black">
            Pastikan informasi data pelatihan terisi dengan benar.
          </p>
          <div className="mt-3 h-px w-full bg-[#E3E3E3]" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Nama Pelatihan
            </label>
            <input
              value={values.namaPelatihan}
              onChange={setField("namaPelatihan")}
              readOnly={readOnly}
              disabled={readOnly}
              placeholder="Masukkan pelatihan..."
              className={fieldCls()}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Deskripsi
            </label>
            <textarea
              value={values.deskripsi}
              onChange={setField("deskripsi")}
              readOnly={readOnly}
              disabled={readOnly}
              rows={4}
              placeholder="Masukkan Deskripsi"
              className={fieldCls("text-sm")}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 ">
              Kategori
            </label>
            <input
              value={values.kategori}
              onChange={setField("kategori")}
              readOnly={readOnly}
              disabled={readOnly}
              placeholder="Masukkan kategori..."
              className={fieldCls()}
            />
          </div>

          {/* Capaian Pembelajaran */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <label className="block text-sm font-semibold">
                Capaian Pembelajaran
              </label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={addCapaian}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <span className="text-base leading-none">+</span>
                  <span>Capaian Pembelajaran</span>
                </button>
              )}
            </div>

            <div className="mt-2 space-y-2">
              {values.capaian.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={c}
                    onChange={(e) => setCapaian(i, e.target.value)}
                    readOnly={readOnly}
                    disabled={readOnly}
                    placeholder="Masukkan capaian..."
                    className={fieldCls()}
                  />
                  {!readOnly && values.capaian.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCapaian(i)}
                      className="inline-flex items-center justify-center px-2.5 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                      title="Hapus capaian"
                      aria-label="Hapus capaian"
                    >
                      <BsTrash size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!readOnly && (
          <div className="mt-6 flex items-center justify-end gap-2">
            {mode === "create" || mode === "editDraft" ? (
              <>
                <button
                  onClick={async () => {
                    if (!onSaveDraft) return;
                    setStatus(null);
                    setSubmitting(true);
                    setSubmittingAction('draft');
                    try {
                      await onSaveDraft(values);
                      setStatus({ type: 'success', message: 'Draft tersimpan.' });
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || e?.message || 'Gagal menyimpan draft.';
                      setStatus({ type: 'error', message: msg });
                    } finally {
                      setSubmitting(false);
                      setSubmittingAction(null);
                    }
                  }}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg border border-[#0F67B1] text-[#0F67B1] hover:bg-[#0F67B1]/5 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submittingAction === 'draft' ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#0F67B1]/40 border-t-[#0F67B1]" aria-hidden="true" />
                      <span>Menyimpan…</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
                <button
                  onClick={async () => {
                    if (!onPublish) return;
                    setStatus(null);
                    setSubmitting(true);
                    setSubmittingAction('publish');
                    try {
                      await onPublish(values);
                      setStatus({ type: 'success', message: 'Pelatihan berhasil diunggah.' });
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || e?.message || 'Gagal mengunggah pelatihan.';
                      setStatus({ type: 'error', message: msg });
                    } finally {
                      setSubmitting(false);
                      setSubmittingAction(null);
                    }
                  }}
                  disabled={!canSubmit || submitting}
                  className="px-4 py-2 rounded-lg bg-[#0F67B1] text-white hover:bg-[#0d5692] disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submittingAction === 'publish' ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden="true" />
                      <span>Mengunggah…</span>
                    </>
                  ) : (
                    <span>Unggah</span>
                  )}
                </button>
              </>
            ) : null}

            {mode === "editPublished" ? (
              <button
                onClick={async () => {
                  if (!onSave) return;
                  setStatus(null);
                  setSubmitting(true);
                  setSubmittingAction('save');
                  try {
                    await onSave(values);
                    setStatus({ type: 'success', message: 'Perubahan tersimpan.' });
                  } catch (e: any) {
                    const msg = e?.response?.data?.message || e?.message || 'Gagal menyimpan perubahan.';
                    setStatus({ type: 'error', message: msg });
                  } finally {
                    setSubmitting(false);
                    setSubmittingAction(null);
                  }
                }}
                disabled={!canSubmit || submitting}
                className="px-4 py-2 rounded-lg bg-[#0F67B1] text-white hover:bg-[#0d5692] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {submittingAction === 'save' ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" aria-hidden="true" />
                    <span>Menyimpan…</span>
                  </>
                ) : (
                  <span>Simpan</span>
                )}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
