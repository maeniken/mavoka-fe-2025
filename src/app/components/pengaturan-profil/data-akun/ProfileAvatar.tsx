"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { RiEditLine } from "react-icons/ri";

interface ProfileAvatarProps { src?: string; name: string; onEdit?: () => void; }

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const API_ROOT = API_BASE.replace(/\/?api\/?$/i, '');

function buildCandidates(raw?: string | null): string[] {
  if (!raw) return [];
  // allow data:, blob:, and http(s) URLs through
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return [raw];
  // If raw is an absolute URL (http(s)://...) and it points to our API root,
  // prefer trying the /storage/... path first, because Laravel's public storage
  // is served from /storage. Example: incoming raw is
  // http://localhost:8000/perusahaan/logo/abc.png -> try
  // http://localhost:8000/storage/perusahaan/logo/abc.png first.
  if (/^(https?:)?\/\//i.test(raw)) {
    try {
      const url = new URL(raw, API_ROOT);
      const root = new URL(API_ROOT);
      // Only rewrite when host:port match the API root host:port
      if (url.host === root.host) {
        const pathname = url.pathname.replace(/^\/+/, '');
        const c1 = `${root.origin}/storage/${pathname}`; // preferred
        const c2 = `${root.origin}/${pathname}`; // fallback
        return Array.from(new Set([c1, c2]));
      }
    } catch (e) {
      // if URL parsing fails, fall back to using raw directly
      return [raw];
    }
  }
  const cleaned = raw.replace(/^\/+/, '');
  const root = API_ROOT.replace(/\/$/, '');
  const cands: string[] = [];
  // Prioritaskan path dengan /storage/ karena file fisiknya berada di storage/app/public
  if (cleaned.startsWith('storage/')) {
    cands.push(`${root}/${cleaned}`);
  } else {
    cands.push(`${root}/storage/${cleaned}`); // first try symlinked storage
    cands.push(`${root}/${cleaned}`); // fallback jika ternyata langsung di public
  }
  return Array.from(new Set(cands));
}

function getInitials(value: string) {
  if (!value) return '?';
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileAvatar({ src, name, onEdit }: ProfileAvatarProps) {
  // Agar tidak terjadi hydration mismatch, render awal (SSR + first client pass) menggunakan apa adanya dari prop.
  const initialCandidates = useMemo(() => buildCandidates(src), [src]);
  const [candidates, setCandidates] = useState<string[]>(initialCandidates);
  const [idx, setIdx] = useState(0);

  // Jika nanti prop src berubah (misal setelah fetch), sinkronkan candidates.
  useEffect(() => {
    setCandidates(buildCandidates(src));
    setIdx(0);
  }, [src]);

  const current = candidates[idx];

  return (
    <div className="flex justify-center mb-2 relative">
      {current ? (
        <img
          key={current}
          src={current}
          alt={name}
          className="w-20 h-20 rounded-full object-cover border border-[#0F67B1]"
          onError={() => setIdx(i => (i + 1 < candidates.length ? i + 1 : i))}
        />
      ) : (
        <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-200 text-gray-700 font-semibold text-2xl">
          {getInitials(name)}
        </div>
      )}

      {/* pencil overlay */}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute right-0 bottom-0 bg-white border border-[#0F67B1] rounded-full p-1 text-black shadow"
          aria-label="Edit foto profil"
        >
          <RiEditLine size={14} />
        </button>
      )}
    </div>
  );
}
