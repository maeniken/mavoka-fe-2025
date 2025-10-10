"use client";

export default function ProgressDots({ filled, total }: { filled: number; total: number }) {
  // total adalah jumlah segmen yang ingin ditampilkan saat ini.
  // Jika belum ada laporan (filled=0), total akan = 1 → 1 garis abu-abu panjang.
  const segments = Math.max(1, total);
  const showSingleLongGray = segments === 1 && filled === 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-[-3px]">
      {Array.from({ length: segments }, (_, i) => {
        const isFilled = i < filled;
        return (
          <div
            key={i}
            className={[
              "h-1.5 rounded-full basis-0 grow",
              showSingleLongGray
                ? "max-w-none" // biar benar-benar panjang penuh saat belum isi
                : "max-w-[52px] sm:max-w-[64px] md:max-w-[84px] lg:max-w-[100px]",
              isFilled ? "bg-[#0F67B1]" : "bg-[#D9D9D9]",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}
