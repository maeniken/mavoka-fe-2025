"use client";

type HeaderBarProps = {
  onAdd: () => void;
  position?: string | null;
  company?: string | null;
  periodStart?: string | Date | null;
  periodEnd?: string | Date | null;
  isLoading?: boolean;
  showAdd?: boolean; // NEW: kontrol visibilitas tombol
};

function formatID(date?: string | Date | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default function HeaderBar({
  onAdd,
  position,
  company,
  periodStart,
  periodEnd,
  isLoading = false,
  showAdd = true, // default: tampil
}: HeaderBarProps) {
  if (isLoading) {
    // SKELETON
    return (
      <div className="mb-6">
        <div className="text-center space-y-1 animate-pulse">
          <div className="mx-auto h-4 md:h-5 w-[320px] md:w-[460px] rounded bg-gray-200" />
          <div className="mx-auto h-3 md:h-4 w-[260px] md:w-[380px] rounded bg-gray-200" />
          <div className="mx-auto h-3 md:h-4 w-[280px] md:w-[420px] rounded bg-gray-200" />
        </div>
        {showAdd && (
          <div className="mt-3 flex justify-end">
            <div className="h-9 w-40 rounded-lg bg-gray-200 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  const pos = position ?? "—";
  const comp = company ?? "—";
  const periode =
    periodStart && periodEnd
      ? `Periode ${formatID(periodStart)} - ${formatID(periodEnd)}`
      : "";

  return (
    <div className="mb-6">
      <div className="text-center">
        <h1 className="text-base md:text-lg font-semibold text-gray-900">
          Laporan Magang Posisi {pos}
        </h1>
        <p className="text-sm md:text-base text-gray-700">{comp}</p>
        {periode && (
          <p className="text-sm md:text-base text-gray-700">{periode}</p>
        )}
      </div>

      {showAdd && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F67B1] px-3 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F67B1]"
          >
            <span className="text-lg">＋</span>
            <span className="text-sm font-medium">Tambah Minggu</span>
          </button>
        </div>
      )}
    </div>
  );
}
