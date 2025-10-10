"use client";
import Image from "next/image";
import { HiUser } from "react-icons/hi";
import { Container } from "@/app/components/Container";
import { useEffect, useState, useMemo } from 'react';
import { getAllSekolah } from '@/services/sekolah';

export default function SmkLogoMarquee() {
  const [schools, setSchools] = useState<{id:string|number; name:string; logo?:string|null;}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  // Fetch sekolah
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await getAllSekolah();
        const mapped = list.map(s => ({ id: s.id, name: s.name, logo: s.logoUrl ?? null }));
        setSchools(mapped);
        if (mapped.length === 0) setError('Belum ada data sekolah');
      } catch (e:any) {
        console.error('[SmkLogoMarquee] fetch error', e);
        setError('Gagal memuat data sekolah');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Gandakan untuk efek looping (minimal 3x agar transisi mulus)
  // Duplikasi untuk loop mulus
  const logos = useMemo(() => schools.length ? [...schools, ...schools, ...schools] : [], [schools]);
  const marqueeDuration = useMemo(() => {
    if (!schools.length) return 40;
    const base = schools.length * 5;
    return Math.max(35, Math.min(90, base));
  }, [schools.length]);

  return (
    <section className="py-8 overflow-x-hidden">
      <Container>
        <h2 className="text-xl tablet:text-2xl font-semibold text-center mb-4">SMK NEGERI & SWASTA</h2>
      </Container>
      <div className="mt-2 relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-blue-100 py-10 overflow-hidden">
        {loading && (
          <div className="flex gap-8 justify-center">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="rounded-full w-20 h-20 border-2 border-dashed border-[#0F67B1] animate-pulse" />
            ))}
          </div>
        )}
        {!loading && error && (
          <p className="text-center text-sm text-gray-600 italic py-4">{error}</p>
        )}
        {!loading && !error && schools.length === 0 && (
          <p className="text-center text-sm text-gray-600 italic py-4">Belum ada sekolah terdaftar.</p>
        )}
        {!loading && !error && schools.length > 0 && (
          <div className="relative select-none" style={{padding:'4px 0'}}>
            <div
              className="flex gap-10 pl-32 pr-32 animate-smk-marquee hover:[animation-play-state:paused] will-change-transform"
              style={{animationDuration:`${marqueeDuration}s`}}
            >
              {logos.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="relative rounded-full border-2 border-[#0F67B1] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                    style={{ width: 90, height: 90 }}
                  >
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.name}
                        fill
                        sizes="90px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiUser className="text-black w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium w-24 text-center truncate" title={item.name}>{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes smk-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .animate-smk-marquee { width: max-content; animation: smk-marquee 40s linear infinite; }
      `}</style>
    </section>
  );
}
