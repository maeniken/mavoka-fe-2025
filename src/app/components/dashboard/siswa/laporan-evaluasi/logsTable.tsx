"use client";

export type DetailLog = {
  date: string;
  photoUrl?: string;
  activity?: string;
  output?: string;
  obstacle?: string;
  solution?: string;
};

type Props = {
  logs: DetailLog[];
  canAdd?: boolean;
  emptyMessage?: string;
};

export default function LogsTable({
  logs,
  canAdd = true,
  emptyMessage,
}: Props) {
  const message =
    emptyMessage ??
    (canAdd
      ? "Belum ada isi laporan. Klik Isi Laporan untuk menambah data."
      : "Belum ada isi laporan.");

  return (
    <div className="rounded-xl border border-gray-300 bg-white p-3 md:p-4">
      <div className="rounded-lg ring-gray-200 overflow-x-auto">
        <table
          className="
            w-full text-xs
            table-fixed
            min-w-[900px] sm:min-w-[1024px] md:min-w-0
          "
        >
          <colgroup>
            {[
              "w-[12%] md:w-[12%]", // Tanggal
              "w-[14%] md:w-[12%]", // Foto
              "w-[30%] md:w-[26%]", // Deskripsi
              "w-[30%] md:w-[26%]", // Output
              "w-[22%] md:w-[12%]", // Hambatan
              "w-[22%] md:w-[12%]", // Solusi
            ].map((cls, i) => (
              <col key={i} className={cls} />
            ))}
          </colgroup>

          <thead className="bg-[#0F67B1] text-white">
            <tr>
              {[
                "TANGGAL",
                "FOTO",
                "DESKRIPSI KEGIATAN",
                "OUTPUT/HASIL KERJA",
                "HAMBATAN",
                "SOLUSI",
              ].map((h, i) => (
                <th
                  key={i}
                  className="px-3 md:px-4 py-3 text-left font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500 bg-white"
                >
                  {message}
                </td>
              </tr>
            ) : (
              logs.map((l, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-100 align-top"
                >
                  <td className="px-3 md:px-4 py-3 text-gray-800 whitespace-nowrap align-top">
                    {l.date}
                  </td>

                  <td className="px-3 md:px-4 py-3 align-top">
                    {l.photoUrl ? (
                      <img
                        src={l.photoUrl}
                        alt="Foto kegiatan"
                        className="h-16 w-24 rounded-md object-cover border border-gray-200"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-3 md:px-4 py-3 text-gray-800 break-words whitespace-pre-line leading-relaxed">
                    {l.activity}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-gray-800 break-words whitespace-pre-line leading-relaxed">
                    {l.output}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-gray-800 break-words whitespace-pre-line leading-relaxed">
                    {l.obstacle}
                  </td>
                  <td className="px-3 md:px-4 py-3 text-gray-800 break-words whitespace-pre-line leading-relaxed">
                    {l.solution}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
