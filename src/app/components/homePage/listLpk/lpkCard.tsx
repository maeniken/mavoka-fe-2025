"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMapPin, HiOutlineLink } from "react-icons/hi2";
import { Lpk } from "@/types/lpk";

type Props = { data: Lpk };

export default function LpkCard({ data }: Props) {
  const router = useRouter();

  const goDetail = useCallback(() => {
    router.push(data.slug ? `/lpk/${data.slug}` : `/lpk/${data.id}`);
  }, [router, data.slug, data.id]);

  const websiteHost = data.web_lembaga?.replace(/^https?:\/\//i, "");

  // Kandidat logo berasal dari mapping LpkList
  const logoCandidates: string[] = (data as any)._logoCandidates || (data.logoUrl ? [data.logoUrl] : []);
  const [logoIdx, setLogoIdx] = useState(0);
  const [allFailed, setAllFailed] = useState(false);
  const activeLogo = useMemo(() => {
    if (allFailed || !logoCandidates.length) return null;
    const raw = logoCandidates[logoIdx];
    if (!raw) return null;
    let src = raw.trim();
    if (!/^https?:\/\//i.test(src)) {
      if (!src.startsWith('/')) src = '/' + src;
      if (/^\/(logos|storage)\//.test(src)) {
        const base = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000').replace(/\/$/, '');
        src = base + src;
      }
    }
    return src;
  }, [logoCandidates, logoIdx, allFailed]);

  const initials = useMemo(() => {
    const parts = (data.name || '').trim().split(/\s+/).slice(0,2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || 'LPK';
  }, [data.name]);

  const [coverFailed, setCoverFailed] = useState(false);
  const coverSrc = useMemo(() => {
    if (coverFailed || !data.coverUrl) return '/assets/img/placeholder-cover.svg';
    let src = data.coverUrl.trim();
    if (!/^https?:\/\//i.test(src)) {
      if (!src.startsWith('/')) src = '/' + src;
      if (/^\/(logos|storage|covers)\//.test(src)) {
        const base = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000').replace(/\/$/, '');
        src = base + src;
      }
    }
    return src;
  }, [data.coverUrl, coverFailed]);

  return (
    <article
      className="rounded-[8px] border border-[#D6DDEB] bg-white 
                 shadow-[0_4px_4px_rgba(0,0,0,0.25)]
                 hover:shadow-[0_6px_8px_rgba(0,0,0,0.28)]
                 transition overflow-hidden flex flex-col"
    >
      <div className="relative w-full">
        <div className="relative mx-auto w-[370px] h-[72px] bg-gray-100 overflow-hidden">
          <Image
            src={coverSrc}
            alt={`${data.name} cover`}
            fill
            className="object-cover"
            sizes="370px"
            onError={() => setCoverFailed(true)}
            priority={false}
          />
        </div>

        {/* logo bulat di tengah: pakai inset-x-0 + justify-center */}
        <div className="absolute -bottom-7 inset-x-0 flex justify-center">
          <div
            className="h-[64px] w-[64px] rounded-full bg-white grid place-items-center
                    border border-[#E5E7EB] shadow-[0_2px_4px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {activeLogo ? (
              <div className="relative h-[56px] w-[56px] rounded-full overflow-hidden bg-white">
                <Image
                  src={activeLogo}
                  alt={`${data.name} logo`}
                  fill
                  className="object-cover"
                  sizes="56px"
                  onError={() => {
                    console.debug('[LpkCard] gagal load logo', activeLogo);
                    setLogoIdx(i => {
                      const next = i + 1;
                      if (next >= logoCandidates.length) {
                        setAllFailed(true);
                        console.warn('[LpkCard] semua kandidat gagal', logoCandidates);
                        return i; // tetap
                      }
                      return next;
                    });
                  }}
                />
              </div>
            ) : (
              <div className="h-[56px] w-[56px] flex items-center justify-center bg-[#E2E8F0] text-[#64748B] text-sm font-bold rounded-full select-none">
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-9 px-4 pb-4">
        <h3 className="text-[#0F67B1] font-extrabold leading-snug line-clamp-2">
          {data.name}
        </h3>

        {/* Alamat */}
        <div className="mt-3 flex items-start gap-2 text-[#94A3B8]">
          <span className="mt-[2px]" aria-hidden>
            <HiOutlineMapPin size={18} />
          </span>
          <p className="text-[13px] leading-relaxed text-[#94A3B8] line-clamp-2">
            {data.address}
          </p>
        </div>

        {/* Website */}
        {data.web_lembaga && (
          <div className="mt-2 flex items-start gap-2 text-[#94A3B8]">
            <span className="mt-[2px]" aria-hidden>
              <HiOutlineLink size={18} />
            </span>
            <a
              href={data.web_lembaga}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#94A3B8] hover:underline truncate max-w-[260px]"
            >
              {websiteHost}
            </a>
          </div>
        )}

        {/* Separator */}
        <hr className="mt-4 border-t border-[#D6DDEB]" />

        {/* Tombol Detail di tengah */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={goDetail}
            className="rounded-full bg-[#0F67B1] px-5 py-2 text-white text-[12px] font-extrabold
                       hover:bg-[#0D5796] focus:outline-none focus:ring-2 focus:ring-[#0F67B1]/50"
            aria-label={`Lihat detail ${data.name}`}
          >
            Detail
          </button>
        </div>
      </div>
    </article>
  );
}
