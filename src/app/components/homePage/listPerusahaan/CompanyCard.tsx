"use client";

import { HiOutlineMapPin } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Company } from "@/types/company";
import { buildLogoCandidates } from "@/lib/logoPath";

const LOGO_H = 72;

type Props = { data: Company };

export default function CompanyCard({ data }: Props) {
  const router = useRouter();
  const goDetail = useCallback(() => {
    router.push(
      data.slug
        ? `/list-perusahaan/${data.slug}`
        : `/list-perusahaan/${data.id}`
    );
  }, [router, data.slug, data.id]);

  // Gunakan buildLogoCandidates yang sudah diperbaiki
  const { primary: primaryLogo, candidates } = useMemo(() => 
    buildLogoCandidates(data.logoUrl), 
    [data.logoUrl]
  );

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[CompanyCard] logo candidates', { logoUrl: data.logoUrl, candidates });
  }

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setIdx(0); setFailed(false); }, [primaryLogo]);
  const current = candidates[idx] || primaryLogo;

  return (
    <article className="rounded-[2px] border border-gray-200 bg-white shadow-[0_4px_4px_rgba(0,0,0,0.25)]  hover:shadow-[0_6px_8px_rgba(0,0,0,0.3)] transition overflow-hidden flex flex-col">
      {/* Logo tengah atas */}
      <div className="relative grid place-items-center px-4 pt-6 pb-4">
        <div className="relative w-full flex items-center justify-center" style={{ height: LOGO_H }}>
          {current && !failed ? (
            <img
              src={current}
              alt={`${data.name} logo`}
              className="object-contain max-h-full w-auto"
              loading="lazy"
              onError={() => {
                if (idx + 1 < candidates.length) {
                  setIdx(idx + 1);
                } else {
                  setFailed(true);
                  if (process.env.NODE_ENV !== 'production') {
                    console.debug('[CompanyCard] gagal memuat semua kandidat logo', { logoUrl: data.logoUrl, candidates });
                  }
                }
              }}
            />
          ) : (
            <img
              src="/assets/img/placeholder-logo.png"
              alt="placeholder"
              className="object-contain max-h-full w-auto opacity-70"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Garis pemisah */}
      <hr className="border-t border-[#D6DDEB]" />

      {/* Nama + alamat + tombol */}
      <div className="p-4 flex-1">
        <h2 className="text-[#0F67B1] leading-snug line-clamp-2">
          {data.name}
        </h2>

        <div className="mt-3 flex items-start gap-3">
          <span className="mt-1 text-[#94A3B8]" aria-hidden>
            <HiOutlineMapPin size={18} />
          </span>

          <p className=" text-[#B7B7B7] leading-relaxed line-clamp-2 flex-1">
            {data.address}
          </p>

          <button
            type="button"
            onClick={goDetail}
            className="ml-3 shrink-0 rounded-full bg-[#0F67B1] hover:bg-opacity-70 px-4 py-2 text-white text-[12px] font-extrabold"
            aria-label={`Lihat detail ${data.name}`}
          >
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}
