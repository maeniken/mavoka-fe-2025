"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { HiUser } from "react-icons/hi";
import { Container } from "@/app/components/Container";
import { getAllLpk } from "@/services/lpk";

// Gunakan satu timestamp global agar tidak berubah setiap render
const CACHE_STAMP = Date.now();

// Normalisasi logo agar perubahan terbaru tampil:
// - Cek beberapa kemungkinan nama field (logoUrl, logo_url, logo_lembaga, logo, logoLembaga)
// - Tambah base URL bila relatif
// - Append cache buster query ketika berasal dari storage agar bypass cache
function buildLogoCandidates(raw: any): string[] {
  if (!raw) return [];
  // Ambil berbagai kemungkinan field dari response backend
  let val = raw.logoRaw || raw.logo_lembaga || raw.logo_url || raw.logoUrl || raw.logo || raw.logoLembaga || '';
  if (!val) return [];
  val = String(val).trim();

  const base = (process.env.NEXT_PUBLIC_API_BASE
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:8000').replace(/\/$/, '');

  const out: string[] = [];

  const push = (u: string) => {
    if (!u) return;
    // Hindari duplikasi dan pastikan tidak menimpa urutan prioritas
    if (!out.includes(u)) out.push(u);
  };

  // Helper untuk append cache-buster hanya jika belum ada param v / cb
  const withCache = (u: string) => {
    try {
      const hasQuery = /[?&](v|cb|t)=/i.test(u);
      if (hasQuery) return u; // sudah ada versi / cache buster
      const sep = u.includes('?') ? '&' : '?';
      return `${u}${sep}v=${CACHE_STAMP}`;
    } catch { return u; }
  };

  // ABSOLUTE URL
  if (/^https?:\/\//i.test(val)) {
    if (/\/lpk\/logo\//i.test(val) && !/\/storage\/lpk\/logo\//i.test(val)) {
      // Prioritaskan langsung storage variant (yang kamu pastikan 200) agar tidak memicu error pertama
      const alt = val.replace(/\/lpk\/logo\//i, '/storage/lpk/logo/');
      push(withCache(alt));
      // Original tetap ditambahkan sebagai fallback kedua
      push(withCache(val));
      const fileName = val.split('/').pop() || '';
      push(withCache(`${base}/logos/${fileName}`));
      push(withCache(`${base}/logos/lembaga-pelatihan/${fileName}`));
      push(withCache(`${base}/storage/logos/${fileName}`));
      return out;
    }
    // Bukan pola /lpk/logo/ => langsung pakai
    push(withCache(val));
    return out;
  }

  // RELATIVE PATH
  let rel = val.replace(/^\//, '');

  // Jika relative dan pakai pola baru lpk/logo, masukkan original + fallback storage
  if (/^lpk\/logo\//i.test(rel)) {
    // Prioritaskan storage path yang terbukti 200 di server kamu
    push(withCache(`${base}/storage/${rel}`));
    push(withCache(`${base}/storage/lpk/logo/${rel.replace(/^lpk\/logo\//i, '')}`));
    // Original tetap dicoba kemudian agar kalau nanti route /lpk/logo/ sudah aktif tidak perlu ubah FE lagi
    push(withCache(`${base}/${rel}`));
    const fileName = rel.split('/').pop() || '';
    push(withCache(`${base}/logos/${fileName}`));
    push(withCache(`${base}/logos/lembaga-pelatihan/${fileName}`));
    push(withCache(`${base}/storage/logos/${fileName}`));
    return out;
  }

  // Jika sudah storage/lpk/logo (path yang kita inginkan sekarang)
  if (/^storage\/lpk\/logo\//i.test(rel)) {
    push(withCache(`${base}/${rel}`));
    return out;
  }

  // Legacy: logos/... (public/logos)
  if (/^logos\//i.test(rel)) {
    push(withCache(`${base}/${rel}`)); // original (public)
    push(withCache(`${base}/storage/${rel}`)); // jika dipindahkan ke storage
  } else {
    // Kemungkinan berada di storage/logos/...
    push(withCache(`${base}/storage/logos/${rel}`));
  }

  // Generic storage fallback jika belum storage/
  if (!/^storage\//i.test(rel)) push(withCache(`${base}/storage/${rel}`));
  // Public root fallback
  push(withCache(`${base}/${rel}`));

  return out;
}

function useBreakpoint() {
  const [bp, setBp] = useState("desktop");
  useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return bp;
}

export default function TrainingCarousel() {
  const breakpoint = useBreakpoint();
  const [centers, setCenters] = useState<{ id: number|string; name: string; logo?: string|null }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const touchStartX = useRef<number|null>(null);
  const touchEndX = useRef<number|null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getAllLpk();
        const mapped = (data || []).map((l: any) => {
          const candidates = buildLogoCandidates(l);
          return {
            id: l.id,
            name: l.name,
            logo: candidates[0] || null,
            _logoCandidates: candidates,
          };
        });
        setCenters(mapped);
        if (mapped.length === 0) setError("Belum ada data lembaga pelatihan");
      } catch (e) {
        console.error("[TrainingCarousel] fetch error", e);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Re-fetch saat tab kembali fokus untuk menangkap perubahan logo terbaru
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        getAllLpk().then(data => {
          const mapped = (data || []).map((l: any) => {
            const candidates = buildLogoCandidates(l);
            return { id: l.id, name: l.name, logo: candidates[0] || null, _logoCandidates: candidates };
          });
          setCenters(mapped);
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // auto slide
  useEffect(() => {
    if (!centers.length) return;
    const intv = setInterval(() => {
      setCurrentIndex(i => (i + 1) % centers.length);
    }, 3000);
    return () => clearInterval(intv);
  }, [centers.length]);

  const range = breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 4; // same logic as snippet
  const visible = [] as { id:number|string; name:string; logo?:string|null; isCenter:boolean }[];
  for (let i = -range; i <= range; i++) {
    if (!centers.length) break;
    const idx = (currentIndex + i + centers.length) % centers.length;
    visible.push({ ...centers[idx], isCenter: i === 0 });
  }

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const dist = touchStartX.current - touchEndX.current;
    if (dist > 50) setCurrentIndex(i => (i + 1) % centers.length);
    else if (dist < -50) setCurrentIndex(i => (i - 1 + centers.length) % centers.length);
    touchStartX.current = null; touchEndX.current = null;
  };

  return (
    <section className="py-8">
      <Container className="text-center">
        <h2 className="text-xl font-semibold mb-2">Lembaga Pelatihan</h2>
        <p className="text-sm text-gray-600 mb-8">MAVOKA bekerja sama dengan berbagai lembaga pelatihan</p>
        {loading && (
          <div className="flex gap-8 justify-center py-4">
            {Array.from({ length: 5 }).map((_,i)=>(
              <div key={i} className="rounded-full border-2 border-dashed border-[#0F67B1] w-[90px] h-[90px] animate-pulse" />
            ))}
          </div>
        )}
        {!loading && error && <p className="text-sm text-gray-500 italic">{error}</p>}
        {!loading && !error && centers.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada lembaga terdaftar</p>}
        {!loading && !error && centers.length > 0 && (
          <div
            className="flex gap-8 justify-center overflow-visible select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ padding:'20px 0', minHeight:'140px' }}
          >
            {visible.map((c,i)=>(
              <div
                key={c.id+String(i)}
                className={`flex flex-col items-center transition-transform duration-500 ${c.isCenter ? 'scale-125' : 'scale-100'} `}
              >
                <div
                  className="relative rounded-full border-2 border-[#0F67B1] bg-white shadow-sm overflow-hidden"
                  style={{ width:90, height:90 }}
                >
                  {(() => {
                    const candidates: string[] = (c as any)._logoCandidates || (c.logo ? [c.logo] : []);
                    if (!candidates.length) {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiUser className="w-12 h-12 text-black" />
                        </div>
                      );
                    }
                    return <LogoImage candidates={candidates} alt={c.name} />;
                  })()}
                </div>
                {c.isCenter && <p className="mt-2 text-sm font-medium text-center max-w-[110px]">{c.name}</p>}
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function LogoImage({ candidates, alt }: { candidates: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const [failedAll, setFailedAll] = useState(false);
  const current = candidates[idx];

  if (failedAll) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <HiUser className="w-10 h-10 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      key={current}
      src={current}
      alt={alt}
      fill
      sizes="90px"
      className="object-cover w-full h-full"
      loading="lazy"
      onError={() => {
        console.debug('[LogoImage] gagal load', current);
        setIdx(i => {
          const next = i + 1;
          if (next >= candidates.length) {
            setFailedAll(true);
            console.warn('[LogoImage] semua kandidat gagal', candidates);
            return i; // tetap
          }
          return next;
        });
      }}
    />
  );
}
