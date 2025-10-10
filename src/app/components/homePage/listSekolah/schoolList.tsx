"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/app/components/Container";
import HeroSearch from "@/app/components/homePage/heroSearch";
import Pagination from "@/app/components/homePage/pagination";
import SchoolCard from "@/app/components/homePage/listSekolah/schoolCard";
import { SchoolCardSkeleton } from "@/app/components/homePage/schoolCardSkeleton";
import { TampilAllSekolah } from "@/lib/api-sekolah";
import { useResponsivePerPage, PER_PAGE } from "@/app/components/homePage/pageResponsive";
import { School } from "@/types/school";

export default function SchoolList() {
  const [data, setData] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q")?.trim() ?? "";
  const currentPage = Math.max(1, Number(sp.get("page") ?? 1) || 1);

  const itemsPerPage = useResponsivePerPage(PER_PAGE.sekolah);

  useEffect(() => {
    let active = true;
    setLoading(true);

    TampilAllSekolah()
      .then((payload: any) => {
        if (!active) return;

        const rows: any[] = payload?.data ?? payload ?? [];

        const normalizeUrl = (v?: string | null) => {
          if (!v) return null;
          const trimmed = String(v).trim();
          if (!trimmed) return null;
          return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
        };

        const mapped: School[] = rows.map((r: any) => ({
          id: r.id,
          name: r.nama_sekolah ?? "Sekolah",
          address: r.alamat ?? "-",
          type: r.jenis_smk ?? r.jenis_sekolah ?? r.status_verifikasi ?? null,
          website: normalizeUrl(r.web_sekolah ?? null),
          logoUrl: r.logo_url ?? r.logo ?? null,
          slug: r.slug,
        }));

        setData(mapped);
        setErr(null);
      })
      .catch((e: any) => setErr(e?.message ?? "Gagal memuat data"))
      .finally(() => setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!q) return data;
    const s = q.toLowerCase();
    return data.filter((d) =>
      [d.name, d.address, d.type ?? "", d.website ?? ""].some((v) =>
        v.toLowerCase().includes(s)
      )
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
        title="Sekolah"
        imageSrc="/img/GAMBAR-PERUSAHAAN.png"
        imageAlt="Sekolah"
        placeholder="Cari nama, alamat, jenis, atau website…"
        objectPosition="50% 40%"
        defaultQuery={q}
        onSearch={handleSearch}
      />

      <Container as="section" className="mt-8">
        <p className="sr-only" aria-live="polite">
          {loading ? "Memuat data…" : `${totalItems} sekolah ditemukan`}
        </p>

        {loading && (
          <div className="grid gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-2">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <SchoolCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && err && (
          <p className="text-red-600">Terjadi kesalahan: {err}</p>
        )}

        {!loading && !err && (
          <>
            {totalItems === 0 ? (
              <p className="text-gray-600">
                Tidak ada sekolah yang cocok dengan pencarian.
              </p>
            ) : (
              <>
                <div className="grid gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-2">
                  {paged.map((s) => (
                    <SchoolCard key={s.id} data={s} />
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
