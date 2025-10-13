//"use client";
//import React, { useState } from "react";
//import { BiSolidFilePdf } from "react-icons/bi";
//import useMyApplications from "@/lib/useMyApplications";


//export type ApplicationStatus =
//  | "lamar"
//  | "wawancara"
//  | "penawaran"
//  | "diterima"
//  | "ditolak";

//export type Application = {
//  id: string;
//  posisi: string;
//  perusahaan: string;
//  penempatan: string;
//  cvUrl?: string;
//  transkripUrl?: string;
//  status: ApplicationStatus;
//};

//type Props = {
//  // optional: if provided by parent the table will render this data;
//  // otherwise the table will fetch the current siswa's applications itself.
//  data?: Application[];
//  onAccept?: (id: string) => void;
//  onReject?: (id: string) => void;
//};

//export default function StudentApplicationsTable({ data, onAccept, onReject }: Props) {
//  // fallback handlers
//  const noop = () => {};
//  const accept = onAccept ?? noop;
//  const reject = onReject ?? noop;
//  const [pendingId, setPendingId] = useState<string | null>(null);

//  // if parent didn't provide `data`, fetch from API
//  const { loading: apiLoading, error: apiError, data: apiItems } = useMyApplications();

//  // Ambil id siswa saat ini dari localStorage (tidak pakai state global agar sederhana)
//  let currentSiswaId: string | null = null;
//  if (typeof window !== 'undefined') {
//    try {
//      const raw = localStorage.getItem('user');
//      if (raw) {
//        const u = JSON.parse(raw);
//        currentSiswaId = String(u.id ?? u.siswa_id ?? '');
//      }
//    } catch {}
//  }

//  // Debug panel: tampilkan data mentah dan hasil filter
//  const [showDebug, setShowDebug] = React.useState(false);
//  const filteredRaw = Array.isArray(apiItems)
//    ? apiItems.filter((row: any) => {
//        if (!currentSiswaId) return true;
//        const sid = row.siswa_id ?? row.siswaId ?? (row.siswa && row.siswa.id);
//        return sid ? String(sid) === currentSiswaId : true;
//      })
//    : [];

//  // Panel debug opsional: tekan tombol untuk tampilkan JSON apiItems
//  const debugPanel = (
//    <div className="mb-4 rounded-md border p-3 bg-yellow-50 text-xs text-gray-800">
//      <div className="font-semibold mb-1">Debug: Data apiItems (raw dari API)</div>
//      <pre className="whitespace-pre-wrap break-words max-h-64 overflow-auto">{JSON.stringify(apiItems, null, 2)}</pre>
//    </div>
//  );
//  // (duplicate debug state removed to fix redeclaration error)

//  // map backend item shape to Application expected by this table
//  const mapApiItem = (a: any): Application => {
//    // Perusahaan: utamakan nama_perusahaan
//    let perusahaan =
//      a.nama_perusahaan ||
//      a.perusahaan_nama ||
//      a.perusahaan ||
//      (a.perusahaanObj && (a.perusahaanObj.nama || a.perusahaanObj.name)) ||
//      a.asalSekolah ||
//      (a.perusahaan_id && typeof a.perusahaan_id === 'object' && (a.perusahaan_id.nama || a.perusahaan_id.name)) ||
//      "-";

//    // Penempatan: utamakan lokasi_penempatan
//    let penempatan =
//      a.lokasi_penempatan ||
//      a.penempatan ||
//      (a.lokasi && (a.lokasi.nama || a.lokasi.name)) ||
//      (a.alamat ? String(a.alamat).split(",")[0] : null) ||
//      (a.perusahaanObj && a.perusahaanObj.alamat) ||
//      (a.perusahaan_id && typeof a.perusahaan_id === 'object' && a.perusahaan_id.alamat) ||
//      "-";

//    return {
//      id: String(a.id ?? a.pelamar_id ?? ""),
//      posisi: a.posisi ?? a.posisi_name ?? a.posisiId ?? "-",
//      perusahaan,
//      penempatan,
//      cvUrl: a.cvUrl ?? a.cv_url ?? null,
//      transkripUrl: a.transkripUrl ?? a.transkrip_url ?? null,
//      status: (a.status as ApplicationStatus) || (a.status_lamaran as ApplicationStatus) || "lamar",
//    };
//  };

//  const sourceData: Application[] | null = data
//    ? data
//    : Array.isArray(apiItems)
//    ? apiItems
//        // filter: kalau endpoint /pelamar mengembalikan semua lamaran, batasi milik siswa login saja
//        .filter((row: any) => {
//          if (!currentSiswaId) return true; // jika tidak bisa baca user, tampilkan apa adanya
//            const sid = row.siswa_id ?? row.siswaId ?? (row.siswa && row.siswa.id);
//            return sid ? String(sid) === currentSiswaId : true;
//        })
//        .map(mapApiItem)
//    : apiLoading
//    ? null
//    : [];

//  const headers = [
//    "NO",
//    "POSISI",
//    "PERUSAHAAN",
//    "PENEMPATAN",
//    "CV",
//    "TRANSKRIP",
//    "STATUS LAMARAN",
//    "AKSI",
//  ];
//  const colClasses = [
//    "w-12", // no
//    "w-56", // posisi
//    "w-64", // perusahaan
//    "w-64", // penempatan
//    "w-16", // cv
//    "w-20", // transkrip
//    "w-36 whitespace-nowrap", // status
//    "w-52 whitespace-nowrap", // aksi
//  ];

//  // Note: Selalu render tabel. Saat loading (sourceData null) tampilkan skeleton di tbody.
//  const hasAccepted = Array.isArray(sourceData) && sourceData.some((a) => a.status === "diterima");

//  return (
//    <div className="bg-white rounded-md p-4 shadow">
//      {/* wrapper scrollable */}
//      <div className="w-full overflow-x-auto">
//        <table className="min-w-[900px] table-fixed border-collapse">
//          <thead>
//            <tr className="text-center text-white">
//              {headers.map((h, i) => (
//                <th
//                  key={h}
//                  className={`bg-[#0F67B1] px-4 py-3 text-xs font-bold ${colClasses[i]} ${
//                    i === 0 ? "rounded-tl-[5px]" : ""
//                  } ${i === headers.length - 1 ? "rounded-tr-[5px]" : ""}`}
//                >
//                  {h}
//                </th>
//              ))}
//            </tr>
//          </thead>
//          <tbody>
//            {Array.isArray(sourceData) && sourceData.length > 0 ? (
//              sourceData.map((a, idx) => (
//                <tr
//                  key={a.id}
//                  className="border-b text-xs text-center hover:bg-gray-50 last:border-b-0"
//                >
//                  <td className="px-4 py-4">{idx + 1}</td>
//                  <td className="px-4 py-4">{a.posisi}</td>
//                  <td className="px-4 py-4">{a.perusahaan}</td>
//                  <td className="px-4 py-4">{a.penempatan}</td>
//                  <td className="px-4 py-4 text-center">
//                    {a.cvUrl ? <PdfButton url={a.cvUrl} title="Lihat CV" /> : <span className="text-gray-400">—</span>}
//                  </td>
//                  <td className="px-4 py-4 text-center">
//                    {a.transkripUrl ? (
//                      <PdfButton url={a.transkripUrl} title="Lihat Transkrip" />
//                    ) : (
//                      <span className="text-gray-400">—</span>
//                    )}
//                  </td>
//                  <td className="px-4 py-4 text-center whitespace-nowrap">
//                    <StatusChip status={a.status} />
//                  </td>
//                  <td className="px-4 py-4 text-center">
//                    <ActionButtons
//                      status={a.status}
//                      id={a.id}
//                      onAccept={async (id) => {
//                        if (pendingId) return;
//                        setPendingId(id);
//                        // Optimistic UI: update status locally to 'diterima'
//                        try {
//                          await Promise.resolve(accept(id));
//                        } finally { setPendingId(null); }
//                      }}
//                      onReject={async (id) => {
//                        if (pendingId) return;
//                        setPendingId(id);
//                        // Optimistic UI: update status locally to 'ditolak'
//                        try {
//                          await Promise.resolve(reject(id));
//                        } finally { setPendingId(null); }
//                      }}
//                      pendingId={pendingId}
//                      actionsDisabled={hasAccepted}
//                    />
//                  </td>
//                </tr>
//              ))
//            ) : apiLoading ? (
//              // Skeleton loading rows
//              Array.from({ length: 3 }).map((_, idx) => (
//                <tr key={idx} className="border-b text-xs text-center last:border-b-0 animate-pulse">
//                  {colClasses.map((cls, i) => (
//                    <td key={i} className={`px-4 py-4 ${cls}`}>
//                      <div className="h-4 bg-gray-200 rounded w-full mx-auto" style={{ maxWidth: i === 0 ? 24 : i === 1 ? 80 : i === 2 ? 120 : i === 3 ? 120 : i === 4 || i === 5 ? 32 : i === 6 ? 80 : 60 }} />
//                    </td>
//                  ))}
//                </tr>
//              ))
//            ) : (
//              <tr>
//                <td colSpan={headers.length} className="px-4 py-6 text-center text-sm text-gray-600">
//                  {apiError ? `Gagal memuat lamaran: ${String(apiError)}` : "Belum melamar lowongan."}
//                </td>
//              </tr>
//            )}
//          </tbody>
//        </table>
//      </div>
//    </div>
//  );
//}

//function StatusChip({ status }: { status: ApplicationStatus }) {
//  const map: Record<ApplicationStatus, string> = {
//    lamar: "bg-[#E3E3E3] text-[#646161]",
//    wawancara: "bg-[#FFF0B5] text-[#E57A00]",
//    penawaran: "bg-[#E57A00] text-[#FFF0B5]",
//    diterima: "bg-[#CDFFCD] text-[#007F00]",
//    ditolak: "bg-[#FFE0E0] text-[#D30000]",
//  };
//  const label: Record<ApplicationStatus, string> = {
//    lamar: "Lamar",
//    wawancara: "Wawancara",
//    penawaran: "Penawaran",
//    diterima: "Diterima",
//    ditolak: "Ditolak",
//  };
//  return (
//    <span
//      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status]}`}
//    >
//      ● {label[status]}
//    </span>
//  );
//}

//function PdfButton({ url, title }: { url: string; title: string }) {
//  return (
//    <a
//      href={url}
//      target="_blank"
//      rel="noopener noreferrer"
//      title={title}
//      aria-label={title}
//      className="inline-flex h-8 w-8 items-center justify-center bg-transparent"
//    >
//      <BiSolidFilePdf size={22} style={{ color: "rgb(220, 38, 38)" }} />
//    </a>
//  );
//}

//function ActionButtons({
//  status,
//  id,
//  onAccept,
//  onReject,
//  pendingId,
//  actionsDisabled,
//}: {
//  status: ApplicationStatus;
//  id: string;
//  onAccept: (id: string) => void | Promise<void>;
//  onReject: (id: string) => void | Promise<void>;
//  pendingId?: string | null;
//  actionsDisabled?: boolean;
//}) {
//  const isPending = pendingId === id;
//  if (status === "penawaran" && !actionsDisabled) {
//    return (
//      <div className="flex justify-center gap-2 whitespace-nowrap">
//        <Btn color="green" onClick={() => onAccept(id)} disabled={isPending} loading={isPending}>
//          {isPending ? "Memproses..." : "Terima"}
//        </Btn>
//        <Btn color="red" onClick={() => onReject(id)} disabled={isPending}>
//          {"Tolak"}
//        </Btn>
//      </div>
//    );
//  }
//  return <div className="text-gray-400">—</div>;
//}

//function Btn({
//  children,
//  color,
//  onClick,
//  disabled,
//  loading,
//}: {
//  children: React.ReactNode;
//  color: "green" | "red";
//  onClick: () => void;
//  disabled?: boolean;
//  loading?: boolean;
//}) {
//  const colorMap = {
//    green: "bg-green-600 hover:brightness-110",
//    red: "bg-red-600 hover:brightness-110",
//  };
//  return (
//    <button
//      className={`inline-flex h-9 w-28 items-center justify-center gap-2 rounded-md text-xs font-semibold text-white ${colorMap[color]} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
//      onClick={() => { if (disabled) return; onClick(); }}
//      disabled={disabled}
//    >
//      {loading && (
//        <svg
//          className="h-5 w-5 shrink-0 animate-spin text-white"
//          viewBox="0 0 24 24"
//          role="status"
//          aria-label="Memproses"
//        >
//          <circle
//            className="opacity-25"
//            cx="12"
//            cy="12"
//            r="10"
//            stroke="currentColor"
//            strokeWidth="4"
//            fill="none"
//          />
//          <circle
//            className="opacity-100"
//            cx="12"
//            cy="12"
//            r="10"
//            stroke="currentColor"
//            strokeWidth="4"
//            strokeDasharray="80 100"
//            strokeDashoffset="60"
//            strokeLinecap="round"
//            fill="none"
//          />
//        </svg>
//      )}
//      {children}
//    </button>
//  );
//}


"use client";
import React, { useState } from "react";
import { BiSolidFilePdf } from "react-icons/bi";
import useMyApplications from "@/lib/useMyApplications";

export type ApplicationStatus = "lamar" | "wawancara" | "penawaran" | "diterima" | "ditolak";

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
  data?: Application[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  /** Sembunyikan kolom Aksi (untuk beranda) */
  showActions?: boolean;
  /** Batasi jumlah baris yang ditampilkan (mis. di beranda) */
  maxRows?: number;
};

export default function StudentApplicationsTable({
  data,
  onAccept,
  onReject,
  showActions = true,
  maxRows,
}: Props) {
  const noop = () => {};
  const accept = onAccept ?? noop;
  const reject = onReject ?? noop;
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { loading: apiLoading, error: apiError, data: apiItems } = useMyApplications();

  let currentSiswaId: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        currentSiswaId = String(u.id ?? u.siswa_id ?? "");
      }
    } catch {}
  }

  const mapApiItem = (a: any): Application => {
    let perusahaan =
      a.nama_perusahaan ||
      a.perusahaan_nama ||
      a.perusahaan ||
      (a.perusahaanObj && (a.perusahaanObj.nama || a.perusahaanObj.name)) ||
      (a.perusahaan_id && typeof a.perusahaan_id === "object" && (a.perusahaan_id.nama || a.perusahaan_id.name)) ||
      "-";

    let penempatan =
      a.lokasi_penempatan ||
      a.penempatan ||
      (a.lokasi && (a.lokasi.nama || a.lokasi.name)) ||
      (a.alamat ? String(a.alamat).split(",")[0] : null) ||
      (a.perusahaanObj && a.perusahaanObj.alamat) ||
      (a.perusahaan_id && typeof a.perusahaan_id === "object" && a.perusahaan_id.alamat) ||
      "-";

    return {
      id: String(a.id ?? a.pelamar_id ?? ""),
      posisi: a.posisi ?? a.posisi_name ?? a.posisiId ?? "-",
      perusahaan,
      penempatan,
      cvUrl: a.cvUrl ?? a.cv_url ?? null,
      transkripUrl: a.transkripUrl ?? a.transkrip_url ?? null,
      status: (a.status as ApplicationStatus) || (a.status_lamaran as ApplicationStatus) || "lamar",
    };
  };

  const sourceData: Application[] | null = data
    ? data
    : Array.isArray(apiItems)
    ? apiItems
        .filter((row: any) => {
          if (!currentSiswaId) return true;
          const sid = row.siswa_id ?? row.siswaId ?? (row.siswa && row.siswa.id);
          return sid ? String(sid) === currentSiswaId : true;
        })
        .map(mapApiItem)
    : apiLoading
    ? null
    : [];

  // Terapkan limit baris kalau diminta
  const viewData =
    Array.isArray(sourceData) && typeof maxRows === "number"
      ? sourceData.slice(0, Math.max(0, maxRows))
      : sourceData;

  const headers = [
    "NO",
    "POSISI",
    "PERUSAHAAN",
    "PENEMPATAN",
    "CV",
    "TRANSKRIP",
    "STATUS LAMARAN",
    ...(showActions ? (["AKSI"] as const) : []),
  ];

  const colClasses = [
    "w-12",
    "w-56",
    "w-64",
    "w-64",
    "w-16",
    "w-20",
    "w-36 whitespace-nowrap",
    ...(showActions ? ["w-52 whitespace-nowrap"] : []),
  ];

  const hasAccepted = Array.isArray(viewData) && viewData.some((a) => a.status === "diterima");

  return (
    <div className="bg-white rounded-md p-4 shadow">
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
            {Array.isArray(viewData) && viewData.length > 0 ? (
              viewData.map((a, idx) => (
                <tr key={a.id} className="border-b text-xs text-center hover:bg-gray-50 last:border-b-0">
                  <td className="px-4 py-4">{idx + 1}</td>
                  <td className="px-4 py-4">{a.posisi}</td>
                  <td className="px-4 py-4">{a.perusahaan}</td>
                  <td className="px-4 py-4">{a.penempatan}</td>
                  <td className="px-4 py-4 text-center">
                    {a.cvUrl ? <PdfButton url={a.cvUrl} title="Lihat CV" /> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {a.transkripUrl ? <PdfButton url={a.transkripUrl} title="Lihat Transkrip" /> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    <StatusChip status={a.status} />
                  </td>

                  {/* Kolom Aksi dikondisikan */}
                  {showActions && (
                    <td className="px-4 py-4 text-center">
                      <ActionButtons
                        status={a.status}
                        id={a.id}
                        onAccept={async (id) => {
                          if (pendingId) return;
                          setPendingId(id);
                          try {
                            await Promise.resolve(accept(id));
                          } finally {
                            setPendingId(null);
                          }
                        }}
                        onReject={async (id) => {
                          if (pendingId) return;
                          setPendingId(id);
                          try {
                            await Promise.resolve(reject(id));
                          } finally {
                            setPendingId(null);
                          }
                        }}
                        pendingId={pendingId}
                        actionsDisabled={hasAccepted}
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : apiLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="border-b text-xs text-center last:border-b-0 animate-pulse">
                  {colClasses.map((cls, i) => (
                    <td key={i} className={`px-4 py-4 ${cls}`}>
                      <div
                        className="h-4 bg-gray-200 rounded w-full mx-auto"
                        style={{
                          maxWidth:
                            i === 0
                              ? 24
                              : i === 1
                              ? 80
                              : i === 2
                              ? 120
                              : i === 3
                              ? 120
                              : i === 4 || i === 5
                              ? 32
                              : i === 6
                              ? 80
                              : 60,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-sm text-gray-600">
                  {apiError ? `Gagal memuat lamaran: ${String(apiError)}` : "Belum melamar lowongan."}
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
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status]}`}>● {label[status]}</span>;
}

function PdfButton({ url, title }: { url: string; title: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title={title} aria-label={title} className="inline-flex h-8 w-8 items-center justify-center bg-transparent">
      <BiSolidFilePdf size={22} style={{ color: "rgb(220, 38, 38)" }} />
    </a>
  );
}

function ActionButtons({
  status,
  id,
  onAccept,
  onReject,
  pendingId,
  actionsDisabled,
}: {
  status: ApplicationStatus;
  id: string;
  onAccept: (id: string) => void | Promise<void>;
  onReject: (id: string) => void | Promise<void>;
  pendingId?: string | null;
  actionsDisabled?: boolean;
}) {
  const isPending = pendingId === id;
  if (status === "penawaran" && !actionsDisabled) {
    return (
      <div className="flex justify-center gap-2 whitespace-nowrap">
        <Btn color="green" onClick={() => onAccept(id)} disabled={isPending} loading={isPending}>
          {isPending ? "Memproses..." : "Terima"}
        </Btn>
        <Btn color="red" onClick={() => onReject(id)} disabled={isPending}>
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
  disabled,
  loading,
}: {
  children: React.ReactNode;
  color: "green" | "red";
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const colorMap = { green: "bg-green-600 hover:brightness-110", red: "bg-red-600 hover:brightness-110" };
  return (
    <button
      className={`inline-flex h-9 w-28 items-center justify-center gap-2 rounded-md text-xs font-semibold text-white ${colorMap[color]} ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
      disabled={disabled}
    >
      {loading && (
        <svg className="h-5 w-5 shrink-0 animate-spin text-white" viewBox="0 0 24 24" role="status" aria-label="Memproses">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <circle className="opacity-100" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="80 100" strokeDashoffset="60" strokeLinecap="round" fill="none" />
        </svg>
      )}
      {children}
    </button>
  );
}
