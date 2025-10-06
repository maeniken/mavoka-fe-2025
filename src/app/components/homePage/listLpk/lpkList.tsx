"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/app/components/Container";
import HeroSearch from "@/app/components/homePage/heroSearch";
import Pagination from "@/app/components/homePage/pagination";
import LpkCard from "./lpkCard";
import { useResponsivePerPage, PER_PAGE } from "@/app/components/homePage/pageResponsive";
import { TampilAlllpk } from "@/lib/api-lpk";
import type { Lpk } from "@/types/lpk";
import { LpkCardSkeleton } from "@/app/components/homePage/lpkCardSkeleton";

// Reuse similar timestamp for cache busting; new mounts can reuse Date.now()
const CACHE_STAMP = Date.now();

// Utility mirip dengan di carousel tapi dipersempit: prioritaskan storage/ versi karena itu yang 200
function buildLogoCandidates(raw: any): string[] {
  if (!raw) return [];
  let val = raw.logoRaw || raw.logo_lembaga || raw.logo_url || raw.logoUrl || raw.logo || null;
  if (!val) return [];
  val = String(val).trim();
  const base = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const out: string[] = [];
  const push = (u: string) => { if (u && !out.includes(u)) out.push(u); };
  const withCache = (u: string) => /[?&](v|cb|t)=/i.test(u) ? u : `${u}${u.includes('?') ? '&' : '?'}v=${CACHE_STAMP}`;

  if (/^https?:\/\//i.test(val)) {
    if (/\/lpk\/logo\//i.test(val) && !/\/storage\/lpk\/logo\//i.test(val)) {
      const alt = val.replace(/\/lpk\/logo\//i, '/storage/lpk/logo/');
      push(withCache(alt));
      push(withCache(val));
      const fileName = val.split('/').pop() || '';
      push(withCache(`${base}/storage/logos/${fileName}`));
      push(withCache(`${base}/logos/${fileName}`));
    } else {
      push(withCache(val));
    }
    return out;
  }

  let rel = val.replace(/^\//,'');
  if (/^lpk\/logo\//i.test(rel)) {
    push(withCache(`${base}/storage/${rel}`));
    push(withCache(`${base}/storage/lpk/logo/${rel.replace(/^lpk\/logo\//i,'')}`));
    push(withCache(`${base}/${rel}`));
    const fileName = rel.split('/').pop() || '';
    push(withCache(`${base}/storage/logos/${fileName}`));
    push(withCache(`${base}/logos/${fileName}`));
    return out;
  }
  if (/^storage\/lpk\/logo\//i.test(rel)) {
    push(withCache(`${base}/${rel}`));
    return out;
  }
  if (/^logos\//i.test(rel)) {
    push(withCache(`${base}/${rel}`));
    push(withCache(`${base}/storage/${rel}`));
  } else {
    push(withCache(`${base}/storage/logos/${rel}`));
  }
  if (!/^storage\//i.test(rel)) push(withCache(`${base}/storage/${rel}`));
  push(withCache(`${base}/${rel}`));
  return out;
}

export default function LpkList() {
  const [data, setData] = useState<Lpk[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q")?.trim() ?? "";
  const currentPage = Math.max(1, Number(sp.get("page") ?? 1) || 1);

  // Items per page: desktop 12 (3x4), tablet 6 (2x3), mobile 6 (1x6)
  const itemsPerPage = useResponsivePerPage(PER_PAGE.lpk);

  useEffect(() => {
    let active = true;
    setLoading(true);

    TampilAlllpk()
      .then((payload: any) => {
        if (!active) return;

        const rows: any[] = payload?.data ?? payload ?? [];

        const normalizeUrl = (v?: string | null) => {
          if (!v) return null;
          const t = String(v).trim();
          if (!t) return null;
          return /^https?:\/\//i.test(t) ? t : `https://${t}`;
        };

        const mapped: Lpk[] = rows.map((r: any) => {
          const web = normalizeUrl(r.web_lembaga ?? null);
          const candidates = buildLogoCandidates(r);
          const primary = candidates[0] || '/assets/img/placeholder-logo.svg';
          // Cover handling seperti sebelumnya
          let cover = r.cover_url ?? '/assets/img/placeholder-cover.svg';
          if (cover && !/^https?:\/\//i.test(cover)) {
            if (!cover.startsWith('/')) cover = '/' + cover;
            if (/^\/(logos|storage|covers)\//.test(cover)) {
              const base = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000').replace(/\/$/, '');
              cover = base + cover;
            }
          }
          return {
            id: r.id,
            name: r.nama_lembaga ?? 'LPK',
            address: r.alamat ?? '-',
            web_lembaga: web,
            logoUrl: primary,
            coverUrl: cover,
            bidang_pelatihan: r.bidang_pelatihan ?? null,
            deskripsi_lembaga: r.deskripsi_lembaga ?? null,
            slug: r.slug,
            email: r.email ?? undefined,
            _logoCandidates: candidates,
          } as Lpk & { _logoCandidates?: string[] };
        });

        setData(mapped);
        setErr(null);
      })
      .catch((e: any) => setErr(e?.message ?? "Gagal memuat data"))
      .finally(() => setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  // Filter lokal (nama / alamat / website)
  const filtered = useMemo(() => {
    if (!q) return data;
    const s = q.toLowerCase();
    return data.filter((d) =>
      [d.name, d.address, d.web_lembaga ?? ""].some((v) => v.toLowerCase().includes(s))
    );
  }, [data, q]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage, itemsPerPage]);

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(sp?.toString());
      query ? params.set("q", query) : params.delete("q");
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: true });
    },
    [router, sp]
  );

  const onPageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(sp?.toString());
      params.set("page", String(page));
      router.push(`?${params.toString()}`, { scroll: true });
    },
    [router, sp]
  );

  return (
    <main className="pb-12">
      <HeroSearch
        title="LPK"
        imageSrc="/img/lembaga_latihan.png"
        imageAlt="LPK"
        placeholder="Cari Lembaga Pelatihan…"
        objectPosition="50% 40%"
        defaultQuery={q}
        onSearch={handleSearch}
      />

      <Container as="section" className="mt-8">
        <p className="sr-only" aria-live="polite">
          {loading ? "Memuat data…" : `${totalItems} LPK ditemukan`}
        </p>

        {loading && (
          <div className="grid gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <LpkCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && err && <p className="text-red-600">Terjadi kesalahan: {err}</p>}

        {!loading && !err && (
          <>
            {totalItems === 0 ? (
              <p className="text-gray-600">Tidak ada LPK yang cocok dengan pencarian.</p>
            ) : (
              <>
                <div className="grid gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
                  {paged.map((c) => (
                    <LpkCard key={c.id} data={c} />
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={safePage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                  />
                </div>
              </>
            )}
          </>
        )}
      </Container>
    </main>
  );
}
