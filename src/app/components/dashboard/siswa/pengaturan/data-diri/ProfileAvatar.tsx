"use client";
import { useEffect, useMemo, useState } from 'react';
import { buildAvatarCandidates } from '@/lib/avatar';

export default function ProfileAvatar({ src, name }: { src: string; name: string }) {
  const initials = useMemo(() => getInitials(name), [name]);
  const [cands, setCands] = useState<string[]>(() => buildAvatarCandidates(src));
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setCands(buildAvatarCandidates(src));
    setIdx(0);
  }, [src]);

  const current = cands[idx];

  return (
    <div className="flex justify-center mb-2">
      {current ? (
        <img
          key={current}
            src={current}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border"
            onError={() => setIdx(i => (i + 1 < cands.length ? i + 1 : i))}
        />
      ) : (
        <div className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-200 text-gray-700 font-semibold text-2xl">
          {initials}
        </div>
      )}
    </div>
  );
}

function getInitials(fullName: string) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
