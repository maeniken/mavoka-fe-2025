//"use client";

//import Image from "next/image";
//import { useCallback, useMemo } from "react";
//import { useRouter } from "next/navigation";
//import { HiOutlineMapPin, HiOutlineLink, HiUser } from "react-icons/hi2";
//import { School } from "@/types/school";

//type Props = { data: School };

//export default function SchoolCard({ data }: Props) {
//  const router = useRouter();

//  const goDetail = useCallback(() => {
//    router.push(data.slug ? `/sekolah/${data.slug}` : `/sekolah/${data.id}`);
//  }, [router, data.slug, data.id]);

//  // Bangun sumber logo final: prioritas logoUrl (absolut). Jika tidak ada, coba rakit dari logo_sekolah (relatif)
//  const logoSrc = useMemo(() => {
//    if (data.logoUrl && data.logoUrl.trim() !== "") return data.logoUrl;
//    if (data.logo_sekolah && data.logo_sekolah.trim() !== "") {
//      const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
//      return `${base}/${data.logo_sekolah.replace(/^\//,'')}`;
//    }
//    return null;
//  }, [data.logoUrl, data.logo_sekolah]);

//  return (
//    <article
//      className="rounded-[8px] border border-[#D6DDEB] bg-white 
//                 shadow-[0_4px_4px_rgba(0,0,0,0.25)] 
//                 hover:shadow-[0_6px_8px_rgba(0,0,0,0.28)]
//                 transition overflow-hidden"
//    >
//      <div className="flex">
//        {/* LEFT: Logo */}
//        <div className="w-[120px] tablet:w-[140px] desktop:w-[160px] bg-white p-4 grid place-items-center">
//          <div className="relative h-[80px] w-[80px] desktop:h-[96px] desktop:w-[96px] flex items-center justify-center">
//            {logoSrc ? (
//              <Image
//                src={logoSrc}
//                alt={`${data.name} logo`}
//                fill
//                className="object-contain"
//                sizes="96px"
//              />
//            ) : (
//              <HiUser className=" text-black" size={64} />
//            )}
//          </div>
//        </div>

//        {/* RIGHT: Konten */}
//        <div className="flex-1 bg-[#F7F6FA] p-4 relative">
//          <h3 className="text-[#0F67B1] font-extrabold leading-snug line-clamp-2">
//            {data.name}
//          </h3>

//          {/* Alamat */}
//          <div className="mt-4 flex items-start gap-2 text-[#94A3B8]">
//            <HiOutlineMapPin size={18} />
//            <p className="text-[13px] leading-relaxed line-clamp-2 flex-1">
//              {data.address}
//            </p>
//          </div>

//          {/* Website */}
//          {data.website && (
//            <div className="mt-2 flex items-start gap-2 text-[#94A3B8]">
//              <HiOutlineLink size={18} />
//              <a
//                href={data.website}
//                target="_blank"
//                rel="noopener noreferrer"
//                className="text-[13px] text-[#94A3B8] hover:underline truncate max-w-[240px]"
//              >
//                {data.website}
//              </a>
//            </div>
//          )}

//          {/* Tombol Detail */}
//          <div className="mt-2 flex justify-end">
//            <button
//              type="button"
//              onClick={goDetail}
//              className="rounded-full bg-[#0F67B1] px-5 py-2 text-white text-[12px] font-extrabold
//                         hover:bg-[#0D5796] focus:outline-none focus:ring-2 focus:ring-[#0F67B1]/50"
//            >
//              Detail
//            </button>
//          </div>
//        </div>
//      </div>
//    </article>
//  );
//}

"use client";

import Image from "next/image";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMapPin, HiOutlineLink, HiUser } from "react-icons/hi2";
import { School } from "@/types/school";

type Props = { data: School };

export default function SchoolCard({ data }: Props) {
  const router = useRouter();

  const goDetail = useCallback(() => {
    router.push(data.slug ? `/sekolah/${data.slug}` : `/sekolah/${data.id}`);
  }, [router, data.slug, data.id]);

  // Sumber logo final
  const logoSrc = useMemo(() => {
    if (data.logoUrl && data.logoUrl.trim() !== "") return data.logoUrl;
    if (data.logo_sekolah && data.logo_sekolah.trim() !== "") {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
      return `${base}/${data.logo_sekolah.replace(/^\//, "")}`;
    }
    return null;
  }, [data.logoUrl, data.logo_sekolah]);

  return (
    <article
      className="w-full rounded-[8px] border border-[#D6DDEB] bg-white 
                 shadow-[0_4px_4px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_8px_rgba(0,0,0,0.28)]
                 transition overflow-hidden"
    >
      {/* SELALU ROW: gambar kiri, isi kanan */}
      <div className="flex items-stretch">
        {/* LEFT: Logo (kolom tidak menyusut) */}
        <div className="shrink-0 bg-white grid place-items-center p-3 tablet:p-4 desktop:p-5
                        w-[92px] tablet:w-[130px] desktop:w-[160px]">
          <div className="relative flex items-center justify-center
                          h-[60px] w-[60px] tablet:h-[84px] tablet:w-[84px]
                          desktop:h-[96px] desktop:w-[96px]">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={`${data.name} logo`}
                fill
                className="object-contain"
                sizes="96px"
              />
            ) : (
              <HiUser className="text-black" size={52} />
            )}
          </div>
        </div>

        {/* RIGHT: Konten (min-w-0 agar flex truncation & wrap berjalan) */}
        <div className="flex-1 min-w-0 bg-[#F7F6FA] p-3 tablet:p-4 desktop:p-5">
          {/* Judul */}
          <h3
            className="text-[#0F67B1] font-extrabold leading-snug
                       text-[14px] tablet:text-[16px] desktop:text-[18px]
                       break-words hyphens-auto line-clamp-2"
            title={data.name}
          >
            {data.name}
          </h3>

          {/* Alamat */}
          <div className="mt-2 tablet:mt-3 flex items-start gap-2 text-[#94A3B8]">
            <HiOutlineMapPin className="mt-[2px] shrink-0" size={18} aria-hidden />
            <p
              className="flex-1 min-w-0 text-[12px] tablet:text-[13px] desktop:text-[14px]
                         leading-relaxed whitespace-normal break-words hyphens-auto line-clamp-3"
              title={data.address}
            >
              {data.address}
            </p>
          </div>

          {/* Website */}
          {data.website && (
            <div className="mt-2 flex items-start gap-2 text-[#94A3B8]">
              <HiOutlineLink className="mt-[2px] shrink-0" size={18} aria-hidden />
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0
                           text-[12px] tablet:text-[13px] desktop:text-[14px]
                           hover:underline break-words hyphens-auto"
                title={data.website}
              >
                {data.website}
              </a>
            </div>
          )}

          {/* Tombol Detail: selalu di kanan, tidak terpotong */}
          <div className="mt-3 tablet:mt-4 flex">
            <div className="ml-auto">
              <button
                type="button"
                onClick={goDetail}
                className="rounded-full bg-[#0F67B1] px-4 py-2 tablet:px-5 tablet:py-2
                           text-white text-[12px] tablet:text-[12px] desktop:text-[13px] font-extrabold
                           hover:bg-[#0D5796] focus:outline-none focus:ring-2 focus:ring-[#0F67B1]/50"
                aria-label={`Lihat detail ${data.name}`}
              >
                Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
