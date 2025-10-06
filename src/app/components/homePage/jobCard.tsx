import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { HiUser } from "react-icons/hi";
import { useState, useEffect, useMemo } from "react";
import { buildLogoCandidates } from "@/lib/logoPath";

type JobCardProps = {
  id: number | string; // ⬅️ tambahin id
  companyLogo: string | null;
  title: string;
  company: string;
  location: string;
  positions: number;
  closingDate: string;
};

export default function JobCard({
  id,
  companyLogo,
  title,
  company,
  location,
  positions,
  closingDate,
}: JobCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const { primary: primaryLogo, candidates } = useMemo(() => buildLogoCandidates(companyLogo), [companyLogo]);
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[JobCard] logo candidates', { companyLogo, candidates });
  }

  // state index untuk mencoba kandidat berikutnya jika error
  const [logoIdx, setLogoIdx] = useState(0);
  useEffect(() => { setLogoIdx(0); setImgError(false); }, [companyLogo]);
  const currentLogo = candidates[logoIdx] || primaryLogo;

  return (
    <div className="border p-4 shadow-md hover:shadow-lg transition cursor-pointer h-full flex flex-col">
      <div className="mb-2 min-h-[80px] flex flex-col">
        <h3
          className="text-xl text-[#25324B] font-semibold whitespace-normal break-words"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as any,
            overflow: 'hidden'
          }}
        >
          {title}
        </h3>
        <p className="text-xs text-[#AA999F] font-semibold mt-1">{positions} Posisi</p>
      </div>

      <div className="w-12 h-12 overflow-hidden flex items-center justify-center mb-2">
        {currentLogo && !imgError ? (
          <img
            src={currentLogo}
            alt={`${company} logo`}
            className="object-contain w-full h-full"
            onError={() => {
              if (logoIdx + 1 < candidates.length) {
                setLogoIdx(logoIdx + 1);
              } else {
                setImgError(true);
                if (process.env.NODE_ENV !== 'production') {
                  console.debug('[JobCard] Semua kandidat logo gagal dimuat', { company, original: companyLogo, candidates });
                }
              }
            }}
            loading="lazy"
          />
        ) : (
          <HiUser className="text-black w-12 h-12" />
        )}
      </div>

      <p className="text-[#8C90A4] whitespace-normal break-words">
        <span className="font-medium text-[#5A607F]">{company}</span>
        {" — "}
        {location}
      </p>

      <div className="mt-auto" />

      <hr className="border-gray-200 mb-3" />

      <div className="bg-[#F9F9F9] rounded-md px-3 py-2">
        <p className="text-xs text-[#A1A5B7]">
          <span className="font-medium">Penutupan:</span>{" "}
          <span className="text-[#BA0000]">{closingDate}</span>
        </p>
      </div>

      <button
        onClick={() => router.push(`/lowongan/${id}`)}
        className="bg-[#0F67B1] text-white font-medium w-full shadow-md hover:opacity-90 transition mt-3 flex items-center justify-center gap-2 py-2 rounded-md"
      >
        Lihat Detail <ArrowRight size={20} />
      </button>
    </div>
  );
}
