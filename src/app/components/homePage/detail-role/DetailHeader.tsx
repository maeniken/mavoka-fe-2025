"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";

interface Props {
  name: string;
  logo?: string | null; // kandidat pertama
  _logoCandidates?: string[]; // internal extended prop
  bgImage?: string;
  subtitle?: string;
}

export default function DetailHeader({
  name,
  logo,
  _logoCandidates,
  bgImage = "/img/GAMBAR-PERUSAHAAN.png",
  subtitle,
}: Props) {
  const candidates = useMemo(() => {
    const arr = _logoCandidates && _logoCandidates.length ? _logoCandidates : (logo ? [logo] : []);
    return arr;
  }, [_logoCandidates, logo]);

  const [idx, setIdx] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  const activeLogo = useMemo(() => {
    if (allFailed || !candidates.length) return null;
    let current = candidates[idx];
    if (!current) return null;
    if (/^https?:\/\//i.test(current)) return current;
    const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    return `${base}/${current.replace(/^\//,'')}`;
  }, [candidates, idx, allFailed]);

  return (
    <header className="relative rounded-2xl overflow-hidden border bg-white">
      <div className="h-56 w-full relative">
        <Image
          src={bgImage}
          alt={`${name} background`}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative bg-white flex flex-col items-center p-6">
        <div className="-mt-14 mb-4 w-[90px] h-[90px] rounded-md bg-white shadow flex items-center justify-center overflow-hidden">
          {activeLogo ? (
            <Image
              key={activeLogo}
              src={activeLogo}
              alt={name}
              width={80}
              height={80}
              className="object-contain rounded"
              onError={() => {
                setIdx(i => {
                  const next = i + 1;
                  if (next >= candidates.length) {
                    setAllFailed(true);
                    console.warn('[DetailHeader] semua kandidat logo gagal', candidates);
                    return i;
                  }
                  console.debug('[DetailHeader] gagal load, coba kandidat berikut', candidates[next]);
                  return next;
                });
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
              NO LOGO
            </div>
          )}
        </div>
        <h1 className="font-bold text-[#0F67B1] text-center">
          {name || "-"}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 text-center mt-1">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
