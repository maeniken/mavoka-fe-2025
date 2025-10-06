//"use client";
//import React from "react";
//import { useRouter } from "next/navigation";
//import type { Applicant, ApplicantStatus } from "@/types/pelamar";
//import { BiSolidFilePdf } from "react-icons/bi";

//type Props = {
//  data: Applicant[];
//  onInterviewClick: (a: Applicant) => void;
//  onAccept: (id: string) => void;
//  onReject: (id: string) => void;
//  buildDetailHref?: (id: string) => string;
//};

//export default function Table({ data, onInterviewClick, onAccept, onReject, buildDetailHref }: Props) {
//  const router = useRouter();

//  const headers = [
//    "NO",
//    "NAMA SISWA",
//    "POSISI",
//    "ASAL SEKOLAH",
//    "JURUSAN",
//    "EMAIL",
//    "CV",
//    "TRANSKRIP NILAI",
//    "DETAIL",
//    "STATUS",
//    "AKSI",
//  ];

//  // Ukuran kolom agar tombol & ikon gak tumpah
//  const colClasses = [
//    "w-12",           // NO
//    "w-56",           // NAMA
//    "w-56",           // POSISI
//    "w-52",           // ASAL SEKOLAH
//    "w-60",           // JURUSAN
//    "w-64",           // EMAIL
//    "w-16",           // CV
//    "w-28",           // TRANSKRIP
//    "w-28 whitespace-nowrap", // DETAIL
//    "w-36 whitespace-nowrap", // STATUS
//    "w-[210px] whitespace-nowrap", // AKSI (2 tombol @ w-24 + gap)
//  ];

//  return (
//    <div className="min-w-full">
//      <table className="sticky top-0 z-10 w-full min-w-[1200px] table-fixed border-collapse">
//        <thead>
//          <tr className="text-center text-white">
//            {headers.map((h, i) => (
//              <th
//                key={h}
//                className={`bg-[#0F67B1] px-4 py-3 text-xs font-bold ${colClasses[i]} ${
//                  i === 0 ? "rounded-tl-[5px]" : ""
//                } ${i === headers.length - 1 ? "rounded-tr-[5px]" : ""}`}
//              >
//                {h}
//              </th>
//            ))}
//          </tr>
//        </thead>

//        <tbody>
//          {data.map((a, idx) => (
//            <tr key={a.id} className="border-b text-xs text-center hover:bg-gray-50 last:border-b-0">
//              <td className="px-4 py-4 text-center text-gray-700">{idx + 1}</td>
//              <td className="px-4 py-4 capitalize">{a.nama}</td>
//              <td className="px-4 py-4 capitalize">{a.posisi}</td>
//              <td className="px-4 py-4">{a.asalSekolah}</td>
//              <td className="px-4 py-4">{a.jurusan}</td>
//              <td className="px-4 py-4 break-words">{a.email}</td>

//              {/* CV */}
//              <td className="px-4 py-4 text-center">
//                {a.cvUrl ? <PdfButton title="Lihat CV" url={a.cvUrl} /> : <span className="text-gray-400">—</span>}
//              </td>

//              {/* Transkrip */}
//              <td className="px-4 py-4 text-center">
//                {a.transkripUrl ? (
//                  <PdfButton title="Lihat Transkrip" url={a.transkripUrl} />
//                ) : (
//                  <span className="text-gray-400">—</span>
//                )}
//              </td>

//              {/* Detail */}
//              <td className="px-4 py-4 text-center whitespace-nowrap">
//                <PillButton
//                  label="Detail"
//                  onClick={() => {
//                    const href = buildDetailHref
//                      ? buildDetailHref(a.id)
//                      : `/dashboard-perusahaan/pelamar/${a.id}`;
//                    router.push(href);
//                  }}
//                />
//              </td>

//              {/* Status */}
//              <td className="px-4 py-4 text-center whitespace-nowrap">
//                <StatusChip status={a.status} />
//              </td>

//              {/* Aksi - dua tombol dengan lebar & tinggi seragam */}
//              <td className="px-4 py-4 text-center">
//                <ActionButtons
//                  applicant={a}
//                  onInterviewClick={onInterviewClick}
//                  onAccept={onAccept}
//                  onReject={onReject}
//                />
//              </td>
//            </tr>
//          ))}
//        </tbody>
//      </table>
//    </div>
//  );
//}

///* ===== Sub-komponen lokal ===== */

//// === ganti PillButton lama ===
//function PillButton({ label, onClick }: { label: string; onClick?: () => void }) {
//  return (
//    <button
//      className="inline-flex h-9 w-24 items-center justify-center whitespace-nowrap rounded-[25px]
//                 bg-[#2563EB] text-xs font-semibold leading-none text-white shadow-sm
//                 hover:brightness-110 active:scale-[.99]"
//      onClick={onClick}
//    >
//      {label}
//    </button>
//  );
//}

//function StatusChip({ status }: { status: ApplicantStatus }) {
//  const map: Record<ApplicantStatus, string> = {
//    lamar: "bg-gray-100 text-gray-700",
//    wawancara: "bg-yellow-100 text-yellow-800",
//    diterima: "bg-green-100 text-green-700",
//    ditolak: "bg-red-100 text-red-700",
//  };
//  const label: Record<ApplicantStatus, string> = {
//    lamar: "Lamar",
//    wawancara: "Wawancara",
//    diterima: "Diterima",
//    ditolak: "Ditolak",
//  };
//  return (
//    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status]}`}>
//      ● {label[status]}
//    </span>
//  );
//}

//function PdfButton({ url, title = "Buka PDF" }: { url?: string; title?: string }) {
//  if (!url) return <span className="text-gray-400">—</span>;

//  return (
//    <a
//      href={url}
//      target="_blank"
//      rel="noopener noreferrer"
//      title={title}
//      aria-label={title}
//      className="inline-flex h-8 w-8 items-center justify-center bg-transparent"
//      // bg-transparent mencegah kotak putih dari style global
//    >
//      {/* pakai warna inline agar tidak ketimpa utility/global css */}
//      <BiSolidFilePdf size={22} style={{ color: "rgb(220, 38, 38)" }} />
//    </a>
//  );
//}

//function ActionButtons({
//  applicant,
//  onInterviewClick,
//  onAccept,
//  onReject,
//}: {
//  applicant: Applicant;
//  onInterviewClick: (a: Applicant) => void;
//  onAccept: (id: string) => void;
//  onReject: (id: string) => void;
//}) {
//  const s = applicant.status;

//// === ganti Btn di dalam ActionButtons ===
//const Btn = ({
//  children,
//  color,
//  onClick,
//}: {
//  children: React.ReactNode;
//  color: "green" | "red";
//  onClick: () => void;
//}) => (
//  <button
//    className={`inline-flex h-9 w-24 items-center justify-center whitespace-nowrap
//                rounded-md text-xs font-semibold leading-none text-white
//                ${color === "green" ? "bg-green-600 hover:brightness-110" : "bg-red-600 hover:brightness-110"}`}
//    onClick={onClick}
//  >
//    {children}
//  </button>
//);

//  if (s === "lamar") {
//    return (
//      <div className="flex justify-center gap-2 whitespace-nowrap">
//        <Btn color="green" onClick={() => onInterviewClick(applicant)}>
//          Wawancara
//        </Btn>
//        <Btn color="red" onClick={() => onReject(applicant.id)}>Tolak</Btn>
//      </div>
//    );
//  }
//  if (s === "wawancara") {
//    return (
//      <div className="flex justify-center gap-2 whitespace-nowrap">
//        <Btn color="green" onClick={() => onAccept(applicant.id)}>Terima</Btn>
//        <Btn color="red" onClick={() => onReject(applicant.id)}>Tolak</Btn>
//      </div>
//    );
//  }
//  return <div className="text-center text-gray-400">—</div>;
//}

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Applicant, ApplicantStatus } from "@/types/pelamar";
import { BiSolidFilePdf } from "react-icons/bi";
import DetailPelamarModal from "@/app/components/dashboard/perusahaan/data-pelamar/detailPelamarModal";

type Props = {
  data: Applicant[];
  onInterviewClick: (a: Applicant) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  buildDetailHref?: (id: string) => string;
  offerLoadingId?: string | null;
};

export default function Table({
  data,
  onInterviewClick,
  onAccept,
  onReject,
  offerLoadingId,
}: Props) {
  const router = useRouter();

  // ==== Tambahan state untuk modal ====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );

  const headers = [
    "NO",
    "NAMA SISWA",
    "POSISI",
    "ASAL SEKOLAH",
    "JURUSAN",
    "EMAIL",
    "CV",
    "TRANSKRIP NILAI",
    "DETAIL",
    "STATUS",
    "AKSI",
  ];

  const colClasses = [
    "w-12", // NO
    "w-56", // NAMA
    "w-56", // POSISI
    "w-52", // ASAL SEKOLAH
    "w-60", // JURUSAN
    "w-64", // EMAIL
    "w-16", // CV
    "w-28", // TRANSKRIP
    "w-28 whitespace-nowrap", // DETAIL
    "w-36 whitespace-nowrap", // STATUS
    "w-[210px] whitespace-nowrap", // AKSI
  ];

  return (
    <div className="min-w-full">
      <table className="sticky top-0 z-10 w-full min-w-[1200px] table-fixed border-collapse">
        <thead>
          <tr className="text-center text-white">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`bg-[#0F67B1] px-4 py-2 text-xs font-bold ${
                  colClasses[i]
                } ${i === 0 ? "rounded-tl-[5px]" : ""} ${
                  i === headers.length - 1 ? "rounded-tr-[5px]" : ""
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((a, idx) => (
            <tr
              key={a.id}
              className="border-b text-xs text-center hover:bg-gray-50 last:border-b-0"
            >
              <td className="px-4 py-4 text-center text-gray-700">{idx + 1}</td>
              <td className="px-4 py-4 capitalize">{a.nama || "-"}</td>
              <td className="px-4 py-4 capitalize">{a.posisi || "-"}</td>
              <td className="px-4 py-4">{a.asalSekolah || "-"}</td>
              <td className="px-4 py-4">{a.jurusan || "-"}</td>
              <td className="px-4 py-4 break-words">{a.email || "-"}</td>

              {/* CV */}
              <td className="px-4 py-4 text-center">
                {a.cvUrl ? (
                  <PdfButton title="Lihat CV" url={a.cvUrl} />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>

              {/* Transkrip */}
              <td className="px-4 py-4 text-center">
                {a.transkripUrl ? (
                  <PdfButton title="Lihat Transkrip" url={a.transkripUrl} />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>

              {/* Detail */}
              <td className="px-4 py-4 text-center whitespace-nowrap">
                <PillButton
                  label="Detail"
                  onClick={() => {
                    setSelectedApplicant(a);
                    setIsModalOpen(true);
                  }}
                />
              </td>

              {/* Status */}
              <td className="px-4 py-4 text-center whitespace-nowrap">
                <StatusChip status={a.status} />
              </td>

              {/* Aksi */}
              <td className="px-4 py-4 text-center">
                <ActionButtons
                  applicant={a}
                  onInterviewClick={onInterviewClick}
                  onAccept={onAccept}
                  onReject={onReject}
                  offerLoadingId={offerLoadingId}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === Modal Detail === */}
      <DetailPelamarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={
          selectedApplicant
            ? {
                foto: selectedApplicant.fotoUrl,
                nama: selectedApplicant.nama,
                asalSekolah: selectedApplicant.asalSekolah,
                jurusan: selectedApplicant.jurusan,
                nisn: selectedApplicant.nisn ?? "", // fallback string kosong
                email: selectedApplicant.email || "",
                noHp: selectedApplicant.noHp || "",
                alamat: selectedApplicant.alamat || "",
              }
            : null
        }
      />
    </div>
  );
}

/* ===== Sub-komponen ===== */

function PillButton({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="inline-flex h-9 w-24 items-center justify-center whitespace-nowrap rounded-[25px]
                 bg-[#0F67B1] text-xs font-semibold leading-none text-white shadow-sm
                 hover:brightness-110 active:scale-[.99]"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function StatusChip({ status }: { status: ApplicantStatus }) {
  const map: Record<ApplicantStatus, string> = {
    lamar: "bg-gray-100 text-gray-700",
    wawancara: "bg-yellow-100 text-yellow-800",
    penawaran: "bg-[#FFF4E5] text-[#B45309]",
    diterima: "bg-green-100 text-green-700",
    ditolak: "bg-red-100 text-red-700",
  };
  const label: Record<ApplicantStatus, string> = {
    lamar: "Lamar",
    wawancara: "Wawancara",
    penawaran: "Penawaran",
    diterima: "Diterima",
    ditolak: "Ditolak",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status]}`}
    >
      ● {label[status]}
    </span>
  );
}

function PdfButton({
  url,
  title = "Buka PDF",
}: {
  url?: string;
  title?: string;
}) {
  if (!url) return <span className="text-gray-400">—</span>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      className="inline-flex h-8 w-8 items-center justify-center bg-transparent"
    >
      <BiSolidFilePdf size={22} style={{ color: "rgb(220, 38, 38)" }} />
    </a>
  );
}

function ActionButtons({
  applicant,
  onInterviewClick,
  onAccept,
  onReject,
  offerLoadingId,
}: {
  applicant: Applicant;
  onInterviewClick: (a: Applicant) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  offerLoadingId?: string | null;
}) {
  const s = applicant.status;
  const isOfferLoading = s === "wawancara" && offerLoadingId === applicant.id;

  const Btn = ({
    children,
    color,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    color: "green" | "red" | "orange";
    onClick: () => void;
    disabled?: boolean;
  }) => {
    const colorMap = {
      green: "bg-green-600 hover:brightness-110",
      red: "bg-red-600 hover:brightness-110",
      orange: "bg-[#E57A00] hover:brightness-110",
    };

    return (
      <button
        className={`inline-flex h-9 w-24 items-center justify-center gap-2 whitespace-nowrap
                    rounded-md text-xs font-semibold leading-none text-white ${colorMap[color]}
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100`}
        onClick={() => {
          if (disabled) return;
          onClick();
        }}
        disabled={disabled}
        aria-busy={disabled ? true : undefined}
      >
        {children}
      </button>
    );
  };

  if (s === "lamar") {
    return (
      <div className="flex justify-center gap-2 whitespace-nowrap">
        <Btn color="orange" onClick={() => onInterviewClick(applicant)}>
          Wawancara
        </Btn>
        <Btn color="red" onClick={() => onReject(applicant.id)}>
          Tolak
        </Btn>
      </div>
    );
  }
  if (s === "wawancara") {
    return (
      <div className="flex justify-center gap-2 whitespace-nowrap">
        <Btn color="green" onClick={() => onAccept(applicant.id)} disabled={isOfferLoading}>
          {isOfferLoading && (
            <svg
              className="h-5 w-5 shrink-0 animate-spin text-white"
              viewBox="0 0 24 24"
              role="status"
              aria-label="Memproses"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <circle
                className="opacity-100"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="80 100"
                strokeDashoffset="60"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          )}
          {isOfferLoading ? "Proses..." : "Penawaran"}
        </Btn>
        <Btn color="red" onClick={() => onReject(applicant.id)} disabled={isOfferLoading}>
          Tolak
        </Btn>
      </div>
    );
  }
  if (s === "penawaran") {
    // Setelah status penawaran, perusahaan menunggu respon dari pelamar (siswa).
    // Tidak ada aksi dari sisi perusahaan.
    return (
      <div className="flex items-center justify-center whitespace-nowrap text-xs text-gray-400">
        Menunggu respon pelamar
      </div>
    );
  }
  return <div className="text-center text-gray-400">—</div>;
}
