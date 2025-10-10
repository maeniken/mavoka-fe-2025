//"use client";

//import { useRouter } from "next/navigation";

//export type MonitoringRow = {
//  id: number;
//  nama: string;
//  posisi: string;
//  pelatihan: string;
//  nilaiPelatihan: number;
//  nilaiAkhir: number;
//  laporanId: string;
//};

//type Props = {
//  data: MonitoringRow[]; // onDetail dihapus karena tidak dipakai
//};

//export default function MonitoringTable({ data }: Props) {
//  const router = useRouter();

//  return (
//    <div className="rounded-xl">
//      <div className="-mx-4 overflow-x-auto">
//        <div className="min-w-[1100px] px-4">
//          <table className="w-full text-xs border-collapse">
//            <thead className="bg-[#0F67B1] text-white">
//              <tr>
//                {[
//                  "NO",
//                  "NAMA SISWA",
//                  "POSISI",
//                  "PELATIHAN",
//                  "NILAI AKHIR\nPELATIHAN",
//                  "LAPORAN\nMAGANG",
//                  "NILAI AKHIR\nMAGANG",
//                ].map((h, i, arr) => (
//                  <th
//                    key={i}
//                    className={`px-4 py-1 font-semibold text-center whitespace-pre-line
//                      ${i === 0 ? "rounded-tl-lg" : ""}
//                      ${i === arr.length - 1 ? "rounded-tr-lg" : ""}
//                    `}
//                  >
//                    {h}
//                  </th>
//                ))}
//              </tr>
//            </thead>

//            <tbody>
//              {data.length === 0 ? (
//                <tr>
//                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 bg-white">
//                    Tidak ada data
//                  </td>
//                </tr>
//              ) : (
//                data.map((row, idx) => (
//                  <tr key={row.id} className="border-t border-gray-100 text-xs hover:bg-gray-50">
//                    <td className="px-4 py-3 text-gray-800 text-center">{idx + 1}</td>
//                    <td className="px-4 py-3 text-gray-800 text-left">{row.nama}</td>
//                    <td className="px-4 py-3 text-gray-800 text-left">{row.posisi}</td>
//                    <td className="px-4 py-3 text-gray-800 text-left">{row.pelatihan}</td>
//                    <td className="px-4 py-3 text-gray-800 text-center">{row.nilaiPelatihan}</td>
//                    <td className="px-4 py-3 text-center">
//                      <button
//                        onClick={() =>
//                          router.push(
//                            `/dashboard-perusahaan/monitoring/detail?laporanId=${encodeURIComponent(
//                              row.laporanId
//                            )}`
//                          )
//                        }
//                        className="inline-flex items-center justify-center h-9 w-[100px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-md hover:bg-[#0c599b] transition text-sm"
//                      >
//                        Detail
//                      </button>
//                    </td>
//                    <td className="px-4 py-3 text-gray-800 text-center">{row.nilaiAkhir}</td>
//                  </tr>
//                ))
//              )}
//            </tbody>
//          </table>
//        </div>
//      </div>
//    </div>
//  );
//}

"use client";

import { useRouter } from "next/navigation";

export type MonitoringRow = {
  id: number;
  nama: string;
  posisi: string;
  pelatihan: string;
  nilaiPelatihan: number;
  nilaiAkhir: number;
  laporanId: string;

  // 🔽 opsi periode (pilih salah satu cara)
  periode?: string;                 // contoh: "Jul–Agu 2026"
  periodStart?: string | Date;      // contoh: "2026-07-01"
  periodEnd?: string | Date;        // contoh: "2026-08-31"
};

type Props = {
  data: MonitoringRow[];
};

function formatDate(d?: string | Date) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  // id-ID biar rapi (01 Jul 2026)
  return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPeriode(row: MonitoringRow) {
  if (row.periode) return row.periode;
  const a = formatDate(row.periodStart);
  const b = formatDate(row.periodEnd);
  return a && b ? `${a} – ${b}` : a || b || "-";
}

export default function MonitoringTable({ data }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-xl">
      <div className="-mx-4 overflow-x-auto">
        {/* +1 kolom → tambah min-width sedikit */}
        <div className="min-w-[1250px] px-4">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-[#0F67B1] text-white">
              <tr>
                {[
                  "NO",
                  "NAMA SISWA",
                  "POSISI",
                  "PERIODE",                // 🔹 kolom baru
                  "PELATIHAN",
                  "NILAI AKHIR\nPELATIHAN",
                  "LAPORAN\nMAGANG",
                  "NILAI AKHIR\nMAGANG",
                ].map((h, i, arr) => (
                  <th
                    key={i}
                    className={`px-4 py-1 font-semibold text-center whitespace-pre-line
                      ${i === 0 ? "rounded-tl-lg" : ""}
                      ${i === arr.length - 1 ? "rounded-tr-lg" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.length === 0 ? (
                <tr>
                  {/* 🔽 colSpan ikut jumlah kolom baru = 8 */}
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500 bg-white">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id} className="border-t border-gray-100 text-xs hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 text-gray-800 text-left">{row.nama}</td>
                    <td className="px-4 py-3 text-gray-800 text-left">{row.posisi}</td>

                    {/* 🔹 PERIODE */}
                    <td className="px-4 py-3 text-gray-800 text-left">
                      {formatPeriode(row)}
                    </td>

                    <td className="px-4 py-3 text-gray-800 text-left">{row.pelatihan}</td>
                    <td className="px-4 py-3 text-gray-800 text-center">{row.nilaiPelatihan}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard-perusahaan/monitoring/detail?laporanId=${encodeURIComponent(
                              row.laporanId
                            )}`
                          )
                        }
                        className="inline-flex items-center justify-center h-9 w-[100px] rounded-[5px] bg-[#0F67B1] text-white font-medium shadow-md hover:bg-[#0c599b] transition text-sm"
                      >
                        Detail
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-800 text-center">{row.nilaiAkhir}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
