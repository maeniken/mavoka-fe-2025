"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Container } from "@/app/components/Container";
import HeroSearch from "@/app/components/homePage/heroSearch";
import Pagination from "@/app/components/homePage/pagination";
import CompanyCard from "./CompanyCard";
import CompanyCardSkeleton from "@/app/components/homePage/companyCardSkeleton";
import { Company } from "@/types/company";
import { getAllPerusahaan } from "@/lib/api-perusahaan";
import { useResponsivePerPage, PER_PAGE } from "@/app/components/homePage/pageResponsive";

export default function PerusahaanList() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q")?.trim() ?? "";
  const currentPage = Math.max(1, Number(sp.get("page") ?? 1) || 1);

  // desktop 12, tablet 6, mobile 6 untuk Perusahaan
  const itemsPerPage = useResponsivePerPage(PER_PAGE.perusahaan);

  // Fetch data perusahaan sekali di mount
  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllPerusahaan()
      .then((rows) => {
        if (!active) return;
        setData(rows);
        setErr(null);
      })
      .catch((e) => active && setErr(e?.message ?? "Gagal memuat data"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  // Filter client-side dari ?q=
  const filtered = useMemo(() => {
    if (!q) return data;
    const s = q.toLowerCase();
    return data.filter(
      (d) => d.name.toLowerCase().includes(s) || d.address.toLowerCase().includes(s)
    );
  }, [data, q]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  // Slice halaman
  const paged = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage, itemsPerPage]);

  // Handler search → update query string
  const handleSearch = useCallback((query: string) => {
    const params = new URLSearchParams(sp?.toString());
    query ? params.set("q", query) : params.delete("q");
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: true });
  }, [router, sp]);

  // Handler pagination → update ?page=
  const onPageChange = useCallback((page: number) => {
    const params = new URLSearchParams(sp?.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: true });
  }, [router, sp]);

  return (
    <main className="pb-12">
      <HeroSearch
        title="Daftar Perusahaan"
        imageSrc="/img/GAMBAR-PERUSAHAAN.png"
        imageAlt="Perusahaan"
        placeholder="Cari Perusahaan..."
        objectPosition="50% 40%"
        defaultQuery={q}
        onSearch={handleSearch}
      />

      <Container as="section" className="mt-8">
        <p className="sr-only" aria-live="polite">
          {loading ? "Memuat data…" : `${totalItems} perusahaan ditemukan`}
        </p>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && err && <p className="text-red-600">Terjadi kesalahan: {err}</p>}

        {!loading && !err && (
          <>
            {totalItems === 0 ? (
              <p className="text-gray-600">Tidak ada perusahaan yang cocok dengan pencarian.</p>
            ) : (
              <>
                <div className="grid gap-5 grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3">
                  {paged.map((c) => <CompanyCard key={c.id} data={c} />)}
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
