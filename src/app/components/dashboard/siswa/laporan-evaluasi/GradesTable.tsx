"use client";

export type GradeAspect = {
  id: number;
  name: string;
  criteria?: string;
  score?: number;
};

export default function GradesTable({ aspects }: { aspects: GradeAspect[] }) {
  const numeric = aspects
    .map(a => (typeof a.score === "number" ? a.score : null))
    .filter((v): v is number => v !== null);
  const avg =
    numeric.length ? Math.round(numeric.reduce((s, v) => s + v, 0) / numeric.length) : null;

  return (
    <div className="">
      <div className="rounded-[5px] ring-1 ring-[#D9D5EC] overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          {/* <<— JANGAN ada whitespace di antara <col> */}
          <colgroup>
            {["w-[60px]", "w-[300px]", "", "w-[110px]"].map((cls, i) => (
              <col key={i} className={cls} />
            ))}
          </colgroup>

          <thead className="bg-white text-black">
            <tr>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide">No</th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">Aspek</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">Kriteria</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide border-l border-gray-200">Nilai</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {aspects.map((a, idx) => {
              const hasCriteria = !!a.criteria && a.criteria.trim().length > 0;
              return (
                <tr key={a.id} className="border-t border-gray-200 align-top text-xs">
                  <td className="px-2 py-2 text-gray-700 text-center">{idx + 1}</td>
                  <td className="px-2 py-2 text-gray-900 border-l border-gray-200">{a.name}</td>

                  <td className="px-3 py-2 text-gray-800 border-l border-gray-200">
                    {hasCriteria ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {a.criteria!.split("\n").map((line, i) => (
                          <li key={i}>{line.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="w-full text-center text-gray-400">-</div>
                    )}
                  </td>

                  <td className="px-3 py-2 text-gray-900 border-l border-gray-200 text-center pr-5">
                    {typeof a.score === "number" ? a.score : <span className="text-gray-400">-</span>}
                  </td>
                </tr>
              );
            })}

            <tr className="border-t border-gray-200">
              <td colSpan={3} className="px-3 py-2 text-center text-gray-700 font-medium bg-white">
                Rata-Rata
              </td>
              <td className="px-3 py-2 text-center pr-5 text-gray-900 font-semibold border-l border-gray-200">
                {avg !== null ? avg : <span className="text-gray-400">-</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
