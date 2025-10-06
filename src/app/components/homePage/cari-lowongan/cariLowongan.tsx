"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Container } from "@/app/components/Container";
import { TampilAllLowongan } from "@/lib/api-lowongan";
import JobCard from "@/app/components/homePage/jobCard";
import JobCardSkeleton from "@/app/components/homePage/jobCardSkeleton";
import Pagination from "@/app/components/homePage/pagination";

type Job = {
  id: number;
  judul_lowongan: string;
  posisi: string;
  kuota: number;
  lokasi_penempatan: string;
  deadline_lamaran: string;
  perusahaan: {
    nama_perusahaan: string;
    logo_perusahaan: string | null;
    logo_url?: string | null;
  };
};

export default function CariLowonganResult() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") || 1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
  const rawData = await TampilAllLowongan(); // sudah dijamin array oleh helper
        
        // Debug: Log raw data untuk melihat struktur
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[CariLowonganResult] Raw data from API:', rawData);
          if (rawData?.length > 0) {
            console.debug('[CariLowonganResult] Sample job data:', rawData[0]);
            console.debug('[CariLowonganResult] Sample perusahaan data:', rawData[0]?.perusahaan);
          }
        }

        const posisi = searchParams.get("posisi")?.toLowerCase() || "";
        const perusahaan = searchParams.get("perusahaan")?.toLowerCase() || "";
        const lokasi = searchParams.get("lokasi")?.toLowerCase() || "";
        const jurusan = searchParams.get("jurusan")?.toLowerCase() || "";

        const filtered = (Array.isArray(rawData) ? rawData : [])
          .filter((job: any) => {
            return (
              (!posisi || job.posisi?.toLowerCase().includes(posisi)) &&
              (!perusahaan ||
                job.perusahaan?.nama_perusahaan
                  ?.toLowerCase()
                  .includes(perusahaan)) &&
              (!lokasi ||
                job.lokasi_penempatan?.toLowerCase().includes(lokasi)) &&
              (!jurusan || job.jurusan?.toLowerCase().includes(jurusan))
            );
          })
          // sort ascending by deadline_lamaran (earliest first)
          .sort((a: any, b: any) => {
            const da = new Date(a.deadline_lamaran).getTime();
            const db = new Date(b.deadline_lamaran).getTime();
            if (isNaN(da) && isNaN(db)) return 0;
            if (isNaN(da)) return 1; // put invalid/empty at end
            if (isNaN(db)) return -1;
            return da - db;
          });

        setJobs(filtered);
        
        // Debug: Log filtered jobs untuk melihat logo yang akan diteruskan
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[CariLowonganResult] Filtered jobs:', filtered);
          filtered.forEach((job: any, index: number) => {
            const logoValue = job.perusahaan.logo_url || job.perusahaan.logo_perusahaan;
            console.debug(`[CariLowonganResult] Job ${index} - ${job.perusahaan.nama_perusahaan}:`, {
              logo_url: job.perusahaan.logo_url,
              logo_perusahaan: job.perusahaan.logo_perusahaan,
              finalLogo: logoValue
            });
          });
        }
      } catch (err) {
        console.error("Gagal fetch lowongan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams]); // ✅ tambahkan ini agar filtering reaktif terhadap URL query

  const totalItems = jobs?.length || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentJobs = jobs?.slice(startIndex, startIndex + itemsPerPage) || [];

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    // Gunakan pathname aktual (harusnya /lowongan) agar tidak 404 jika struktur berubah
    const base = pathname && pathname.startsWith('/lowongan') ? '/lowongan' : pathname || '/lowongan';
    router.push(`${base}?${params.toString()}`);
  };

  if (!jobs || !Array.isArray(jobs)) {
    return <p className="text-center py-10">Data lowongan tidak tersedia.</p>;
  }

  return (
    <Container className="py-10">
      {loading ? (
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : currentJobs.length === 0 ? (
        <p>Tidak ada lowongan ditemukan.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4 gap-6">
            {currentJobs.map((job) => {
              // Prioritaskan logo_perusahaan (relative path) karena logo_url dari backend tidak selalu benar
              const logoPath = job.perusahaan.logo_perusahaan || job.perusahaan.logo_url || null;
              
              return (
                <JobCard
                  key={job.id}
                  id={job.id}
                  companyLogo={logoPath}
                  title={job.judul_lowongan}
                  company={job.perusahaan.nama_perusahaan}
                  location={job.lokasi_penempatan}
                  positions={job.kuota}
                  closingDate={new Date(job.deadline_lamaran).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                />
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  );
}
