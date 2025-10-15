//"use client";
//import { useEffect, useMemo, useState } from 'react';
//import { buildAvatarCandidates } from '@/lib/avatar';

//export default function ProfileAvatar({ src, name }: { src: string; name: string }) {
//  const initials = useMemo(() => getInitials(name), [name]);
//  const [cands, setCands] = useState<string[]>(() => buildAvatarCandidates(src));
//  const [idx, setIdx] = useState(0);

//  useEffect(() => {
//    setCands(buildAvatarCandidates(src));
//    setIdx(0);
//  }, [src]);

//  const current = cands[idx];

//  return (
//    <div className="flex justify-center mb-2">
//      {current ? (
//        <img
//          key={current}
//            src={current}
//            alt={name}
//            className="w-20 h-20 rounded-full object-cover border"
//            onError={() => setIdx(i => (i + 1 < cands.length ? i + 1 : i))}
//        />
//      ) : (
//        <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-200 text-gray-700 font-semibold text-2xl">
//          {initials}
//        </div>
//      )}
//    </div>
//  );
//}

//function getInitials(fullName: string) {
//  if (!fullName) return '?';
//  const parts = fullName.trim().split(/\s+/).filter(Boolean);
//  if (parts.length === 1) return parts[0][0].toUpperCase();
//  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
//}


"use client";
import { useEffect, useMemo, useState } from "react";
import { buildAvatarCandidates } from "@/lib/avatar";

export default function ProfileAvatar({
  src,
  name,
  onEdit,
}: {
  src: string;
  name: string;
  onEdit?: () => void;
}) {
  const initials = useMemo(() => getInitials(name), [name]);
  const [cands, setCands] = useState<string[]>(() => buildAvatarCandidates(src));
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setCands(buildAvatarCandidates(src));
    setIdx(0);
  }, [src]);

  const current = cands[idx];

  return (
    <div className="relative flex justify-center mb-2">
      {current ? (
        <img
          key={current}
          src={current}
          alt={name}
          className="w-20 h-20 rounded-full object-cover border border-[#0F67B1]"
          onError={() => setIdx((i) => (i + 1 < cands.length ? i + 1 : i))}
        />
      ) : (
        <div className="w-20 h-20 rounded-full border border-[#0F67B1] flex items-center justify-center bg-gray-100 text-gray-700 font-semibold text-2xl">
          {initials}
        </div>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#0F67B1] text-[#0F67B1] flex items-center justify-center shadow-sm"
          aria-label="Ubah foto"
          title="Ubah foto"
        >
          ✎
        </button>
      )}
    </div>
  );
}

function getInitials(fullName: string) {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
