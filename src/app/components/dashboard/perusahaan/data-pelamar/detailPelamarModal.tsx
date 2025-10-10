"use client";
import React from "react";
import { FiUser } from "react-icons/fi";

type DetailPelamarModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: {
    foto?: string;
    nama: string;
    asalSekolah: string;
    jurusan: string;
    nisn: string;
    email: string;
    noHp: string;
    alamat: string;
  } | null;
};

export default function DetailPelamarModal({
  isOpen,
  onClose,
  data,
}: DetailPelamarModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white shadow-lg max-h-[80vh]">
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 shadow-none hover:text-gray-700"
        >
          ✕
        </button>

        {/* Judul */}
        <div className="px-6 pt-6 text-center">
          <h2 className="text-lg font-semibold">Detail Data Pelamar</h2>
        </div>

        {/* Body dengan scroll */}
        <div className="px-6 py-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col items-center">
            {data.foto ? (
              <img
                src={data.foto}
                alt={data.nama}
                className="mb-4 h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div
                aria-label="Tanpa foto profil"
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-gray-500"
              >
                <FiUser size={36} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Field label="Nama Siswa" value={data.nama} />
            <Field label="Asal Sekolah" value={data.asalSekolah} />
            <Field label="Jurusan" value={data.jurusan} />
            <Field label="NISN" value={data.nisn} />
            <Field label="Email" value={data.email} />
            <Field label="Nomor Handphone" value={data.noHp} />
            <FieldTextArea label="Alamat" value={data.alamat} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        disabled
        className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 
                   text-sm text-gray-700 whitespace-normal"
      />
    </div>
  );
}

function FieldTextArea({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        disabled
        rows={3}
        className="mt-1 w-full resize-none rounded-md border border-gray-300 bg-gray-50 px-3 py-2 
                   text-sm text-gray-700 whitespace-normal"
      />
    </div>
  );
}
