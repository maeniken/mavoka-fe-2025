import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiUser } from "react-icons/hi";
import { useMemo, useState, useCallback } from "react";

type CompanyCardProps = {
  logo?: string | null;
  name: string;
  detailLink: string;
};

export default function CompanyCard({ logo, name, detailLink }: CompanyCardProps) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  // Normalisasi logo: pastikan absolute url atau path yang diawali slash
  const normalized = useMemo(() => {
    if (!logo) return null;
    let src = logo.trim();
    // Jika bukan absolute dan tidak diawali slash → tambah slash
    if (!/^https?:\/\//i.test(src)) {
      if (!src.startsWith('/')) src = '/' + src;
      // Jika path menunjuk ke folder publik backend (logos atau storage) dan bukan dari host kita,
      // buat absolute dengan NEXT_PUBLIC_API_BASE
      if (/^\/(logos|storage)\//.test(src)) {
        const base = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000').replace(/\/$/, '');
        src = base + src; // now absolute
      }
    }
    return src;
  }, [logo]);

  const onClick = useCallback(() => router.push(detailLink), [router, detailLink]);

  const showImage = normalized && !failed;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition flex items-center gap-3"
    >
      <div className="p-[2px] rounded-lg bg-gradient-to-tr from-[#52E5E7] to-[#130CB7]">
        <div className="bg-white rounded-lg flex items-center justify-center w-12 h-12 overflow-hidden">
          {showImage ? (
            <Image
              src={normalized!}
              alt={name}
              width={32}
              height={32}
              onError={() => setFailed(true)}
            />
          ) : (
            <HiUser className="w-8 h-8 text-black" />
          )}
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold">{name}</h3>
      </div>
    </div>
  );
}
