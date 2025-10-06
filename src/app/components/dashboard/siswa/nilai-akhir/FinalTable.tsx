"use client";

type Row = {
  id: string;
  studentName: string;
  position: string;
  trainingName: string;
  trainingScore?: number;
  internshipScore?: number;
  certificateUrl?: string;
};

export default function FinalTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 md:p-2">
      <div className="rounded-lg ring-1 ring-gray-200 overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-[#0F67B1] text-white">
            <tr>
              {["NO","NAMA SISWA","POSISI","PELATIHAN","NILAI AKHIR PELATIHAN","NILAI AKHIR MAGANG","SERTIFIKAT"]
                .map((h,i)=>(
                  <th key={i} className="px-4 py-3 text-center font-semibold">
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  Belum ada data nilai akhir.
                </td>
              </tr>
            ) : rows.map((r,idx)=>(
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{idx+1}</td>
                <td className="px-4 py-3">{r.studentName}</td>
                <td className="px-4 py-3 capitalize">{r.position}</td>
                <td className="px-4 py-3">{r.trainingName}</td>
                <td className="px-4 py-3 text-center">
                  {typeof r.trainingScore==="number" ? r.trainingScore : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {typeof r.internshipScore==="number" ? r.internshipScore : <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-2">
                  {r.certificateUrl ? (
                    <a
                      href={r.certificateUrl}
                      download
                      className="inline-flex items-center rounded-lg bg-[#0F67B1] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Unduh
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                    >
                      Unduh
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
