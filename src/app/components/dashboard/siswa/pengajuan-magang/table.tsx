"use client";
import React from "react";
import { BiSolidFilePdf } from "react-icons/bi";
import useMyApplications from "@/lib/useMyApplications";

export type ApplicationStatus =
  | "lamar"
  | "wawancara"
  | "penawaran"
  | "diterima"
  | "ditolak";

export type Application = {
  id: string;
  posisi: string;
  perusahaan: string;
  penempatan: string;
  cvUrl?: string;
  transkripUrl?: string;
  status: ApplicationStatus;
};

type Props = {
  // optional: if provided by parent the table will render this data;
  // otherwise the table will fetch the current siswa's applications itself.
  data?: Application[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function StudentApplicationsTable({ data, onAccept, onReject }: Props) {
  // fallback handlers
  const noop = () => {};
  const accept = onAccept ?? noop;
  const reject = onReject ?? noop;

  // if parent didn't provide `data`, fetch from API
  const { loading: apiLoading, error: apiError, data: apiItems } = useMyApplications();

  // map backend item shape to Application expected by this table
  const mapApiItem = (a: any): Application => ({
    id: String(a.id ?? a.pelamar_id ?? ""),
    posisi: a.posisi ?? a.posisi_name ?? a.posisiId ?? "-",
    perusahaan: (a.asalSekolah || a.perusahaan || a.perusahaan_nama) ?? "-",
    penempatan: a.alamat ? String(a.alamat).split(",")[0] : a.penempatan ?? "-",
    cvUrl: a.cvUrl ?? a.cv_url ?? null,
    transkripUrl: a.transkripUrl ?? a.transkrip_url ?? null,
    status: (a.status as ApplicationStatus) || (a.status_lamaran as ApplicationStatus) || "lamar",
  });

  const sourceData: Application[] | null = data
    ? data
    : Array.isArray(apiItems)
    ? apiItems.map(mapApiItem)
    : apiLoading
    ? null
    : [];

  const headers = [
    "NO",
    "POSISI",
    "PERUSAHAAN",
    "PENEMPATAN",
    "CV",
    "TRANSKRIP",
    "STATUS LAMARAN",
    "AKSI",
  ];
  const colClasses = [
    "w-12", // no
    "w-56", // posisi
    "w-64", // perusahaan
    "w-64", // penempatan
    "w-16", // cv
    "w-20", // transkrip
    "w-36 whitespace-nowrap", // status
    "w-52 whitespace-nowrap", // aksi
  ];

  // render states: loading / error / empty
  if (!sourceData) {
    return <div className="p-4">Memuat data...</div>;
  }
  // Note: we always render the table (headers) even when there are no rows.
  // For loading we keep the early return. For error or empty data, we'll show
  // a single row message inside the table body so the layout stays consistent.

  return (
    <div className="bg-white rounded-md p-4 shadow">
      {/* wrapper scrollable */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[900px] table-fixed border-collapse">
          <thead>
            <tr className="text-center text-white">
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={`bg-[#0F67B1] px-4 py-3 text-xs font-bold ${colClasses[i]} ${
                    i === 0 ? "rounded-tl-[5px]" : ""
                  } ${i === headers.length - 1 ? "rounded-tr-[5px]" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sourceData) && sourceData.length > 0 ? (
              sourceData.map((a, idx) => (
                <tr
                  key={a.id}
                  className="border-b text-xs text-center hover:bg-gray-50 last:border-b-0"
                >
                  <td className="px-4 py-4">{idx + 1}</td>
                  <td className="px-4 py-4">{a.posisi}</td>
                  <td className="px-4 py-4">{a.perusahaan}</td>
                  <td className="px-4 py-4">{a.penempatan}</td>
                  <td className="px-4 py-4 text-center">
                    {a.cvUrl ? <PdfButton url={a.cvUrl} title="Lihat CV" /> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {a.transkripUrl ? (
                      <PdfButton url={a.transkripUrl} title="Lihat Transkrip" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <StatusChip status={a.status} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ActionButtons status={a.status} id={a.id} onAccept={accept} onReject={reject} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-sm text-gray-600">
                  {apiLoading ? "Memuat data..." : apiError ? `Gagal memuat lamaran: ${String(apiError)}` : "Data tidak ada."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, string> = {
    lamar: "bg-[#E3E3E3] text-[#646161]",
    wawancara: "bg-[#FFF0B5] text-[#E57A00]",
    penawaran: "bg-[#E57A00] text-[#FFF0B5]",
    diterima: "bg-[#CDFFCD] text-[#007F00]",
    ditolak: "bg-[#FFE0E0] text-[#D30000]",
  };
  const label: Record<ApplicationStatus, string> = {
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

function PdfButton({ url, title }: { url: string; title: string }) {
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
  status,
  id,
  onAccept,
  onReject,
}: {
  status: ApplicationStatus;
  id: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (status === "penawaran") {
    return (
      <div className="flex justify-center gap-2 whitespace-nowrap">
        <Btn color="green" onClick={() => onAccept(id)}>
          Terima
        </Btn>
        <Btn color="red" onClick={() => onReject(id)}>
          Tolak
        </Btn>
      </div>
    );
  }
  return <div className="text-gray-400">—</div>;
}

function Btn({
  children,
  color,
  onClick,
}: {
  children: React.ReactNode;
  color: "green" | "red";
  onClick: () => void;
}) {
  const colorMap = {
    green: "bg-green-600 hover:brightness-110",
    red: "bg-red-600 hover:brightness-110",
  };
  return (
    <button
      className={`inline-flex h-9 w-24 items-center justify-center rounded-md text-xs font-semibold text-white ${colorMap[color]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
