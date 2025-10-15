"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Applicant, InterviewPayload } from "@/types/pelamar";

type Props = {
  open: boolean;
  onClose: () => void;
  applicant?: Applicant | null;
  onSubmit: (payload: InterviewPayload) => Promise<void> | void;
};

export default function InterviewModal({ open, onClose, applicant, onSubmit }: Props) {
  const [zoomLink, setZoomLink] = useState("");
  const [waktuText, setWaktuText] = useState("");
  const [tanggalISO, setTanggalISO] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setZoomLink("");
      setWaktuText("");
      setTanggalISO("");
      setStartTime("");
      setEndTime("");
      setSubmitting(false);
      // Focuskan langsung ke jam mulai agar kursor terlihat di input waktu
      setTimeout(() => startRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open || !applicant) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (submitting) return; // cegah menutup saat submit
        handleOverlayClick(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-busy={submitting}
    >
      <div className="w-full max-w-lg rounded-[22px] border-2 border-[#0F67B1] bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
        <h3 className="mb-5 text-center text-xl font-semibold text-gray-900">
          Informasi Pelaksanaan Interview
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Link Zoom</label>
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="Masukkan link Zoom"
              disabled={submitting}
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-70 focus:border-[#0F67B1] focus:ring-1 focus:ring-[#0F67B1]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Waktu</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1 block text-xs text-gray-600">Jam Mulai</span>
                <input
                  type="time"
                  ref={startRef}
                  autoFocus
                  value={startTime}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStartTime(v);
                    setWaktuText(formatRange(v, endTime));
                  }}
                  step={300}
                  disabled={submitting}
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none disabled:opacity-70 caret-[#0F67B1] focus:border-[#0F67B1] focus:ring-1 focus:ring-[#0F67B1]"
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-gray-600">Jam Selesai</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEndTime(v);
                    setWaktuText(formatRange(startTime, v));
                  }}
                  step={300}
                  disabled={submitting}
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none disabled:opacity-70 caret-[#0F67B1] focus:border-[#0F67B1] focus:ring-1 focus:ring-[#0F67B1]"
                />
              </div>
            </div>
            {waktuText ? (
              <p className="mt-2 text-xs text-gray-600">
                Rentang: {waktuText}
                {formatDuration(startTime, endTime) && (
                  <span className="ml-2 text-gray-500">• Durasi: {formatDuration(startTime, endTime)}</span>
                )}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">Pilih jam mulai dan selesai</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Tanggal</label>
            <input
              type="date"
              value={tanggalISO}
              onChange={(e) => setTanggalISO(e.target.value)}
              disabled={submitting}
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none disabled:opacity-70 focus:border-[#0F67B1] focus:ring-1 focus:ring-[#0F67B1]"
            />
          </div>
        </div>

        {/* Footer: tombol KANAN semua */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="h-10 rounded-[10px] border-2 border-[#0F67B1] px-5 text-sm font-medium text-[#0F67B1] hover:bg-blue-50 disabled:opacity-50 active:scale-[.99]"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!zoomLink || !startTime || !endTime || !tanggalISO || submitting}
            onClick={async () => {
              const payload: InterviewPayload = { zoomLink, waktuText, tanggalISO };
              try {
                setSubmitting(true);
                await onSubmit(payload);
              } finally {
                setSubmitting(false);
              }
            }}
            className="h-10 rounded-[10px] bg-[#0F67B1] px-5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50 active:scale-[.99] inline-flex items-center"
          >
            {submitting ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-blue-200 fill-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="progressbar"
                  aria-label="Mengirim"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 26.0115C84.9175 29.1798 86.7997 32.6585 88.1811 36.3211C89.083 38.6503 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                Mengirim...
              </>
            ) : (
              'Kirim'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRange(start: string, end: string) {
  const toHM = (t: string) => (t ? t.slice(0, 5) : "");
  const s = toHM(start);
  const e = toHM(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return `${s}`;
  if (e) return `${e}`;
  return "";
}

function formatDuration(start: string, end: string) {
  if (!start || !end) return "";
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
  };
  let s = toMin(start);
  let e = toMin(end);
  if (!Number.isFinite(s) || !Number.isFinite(e)) return "";
  // Jika end < start, anggap melewati tengah malam (+24 jam)
  if (e < s) e += 24 * 60;
  const diff = e - s;
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);
  return parts.join(" ");
}
