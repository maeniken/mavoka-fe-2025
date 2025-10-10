//"use client";

//import { useEffect, useState } from "react";
//import JobCard from "./jobCard";
//import { ArrowRight } from "lucide-react";
//import { TampilAllLowongan } from "@/lib/api-lowongan";
//import { Container } from "@/app/components/Container";

//type Job = {
//  id: number;
//  judul_lowongan: string;
//  posisi: string;
//  kuota: number;
//  lokasi_penempatan: string;
//  deadline_lamaran: string;
//  perusahaan: {
//    nama_perusahaan: string;
//    logo_perusahaan: string | null;
//  };
//};

//export default function JobList() {
//  const [jobs, setJobs] = useState<Job[]>([]);
//  const [loading, setLoading] = useState(true);

//  useEffect(() => {
//    const fetchJobs = async () => {
//      try {
//        const data = await TampilAllLowongan();
//        setJobs(data);
//      } catch (error) {
//        console.error("Gagal memuat lowongan:", error);
//      } finally {
//        setLoading(false);
//      }
//    };

//    fetchJobs();
//  }, []);

//  return (
//    <section className="mt-10">
//      <Container>
//        <div className="flex justify-between items-center mb-6">
//          <h2 className="text-xl font-semibold">
//            Daftar <span className="text-[#0F67B1]">Lowongan</span>
//          </h2>
//          <a
//            href="/lowongan"
//            className="text-[#0F67B1] hover:underline flex items-center gap-1 text-sm"
//          >
//            Semua lowongan <ArrowRight size={20} />
//          </a>
//        </div>

//        {loading ? (
//          <p>Memuat lowongan...</p>
//        ) : (
//          <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 gap-6">
//            {jobs.slice(0, 8).map((job) => (
//              <JobCard
//                key={job.id}
//                id={job.id}
//                companyLogo={job.perusahaan.logo_perusahaan ?? null}
//                title={job.judul_lowongan}
//                company={job.perusahaan.nama_perusahaan}
//                location={job.lokasi_penempatan}
//                positions={job.kuota}
//                closingDate={new Date(job.deadline_lamaran).toLocaleDateString(
//                  "id-ID",
//                  {
//                    day: "numeric",
//                    month: "long",
//                    year: "numeric",
//                  }
//                )}
//              />
//            ))}
//          </div>
//        )}
//      </Container>
//    </section>
//  );
//}


"use client";

import { useEffect, useState } from "react";
import JobCard from "./jobCard";
import JobCardSkeleton from "./jobCardSkeleton";
import { ArrowRight } from "lucide-react";
import { TampilAllLowongan } from "@/lib/api-lowongan";
import { Container } from "@/app/components/Container";

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
  };
};

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await TampilAllLowongan();
        setJobs(data);
      } catch (error) {
        console.error("Gagal memuat lowongan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <section className="mt-10">
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Daftar <span className="text-[#0F67B1]">Lowongan</span>
          </h2>

          {/* Tablet & Desktop: teks + panah */}
          <a
            href="/lowongan"
            className="hidden tablet:flex items-center gap-1 text-[#0F67B1] hover:underline text-sm"
          >
            Semua lowongan <ArrowRight size={20} />
          </a>

          {/* Mobile: panah saja */}
          <a
            href="/lowongan"
            aria-label="Lihat semua lowongan"
            className="tablet:hidden text-[#0F67B1] hover:underline"
          >
            <ArrowRight size={24} />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 gap-6">
            {jobs.slice(0, 8).map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                companyLogo={job.perusahaan.logo_perusahaan ?? null}
                title={job.judul_lowongan}
                company={job.perusahaan.nama_perusahaan}
                location={job.lokasi_penempatan}
                positions={job.kuota}
                closingDate={new Date(job.deadline_lamaran).toLocaleDateString(
                  "id-ID",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
