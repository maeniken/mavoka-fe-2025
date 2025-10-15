"use client";

import HeaderHome from "@/app/components/homePage/headerHomepage";
import "aos/dist/aos.css";
import Footer from "@/app/components/homePage/footer";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCompanyById } from "@/services/company";
import { Company } from "@/types/company";
import DetailDescription from "@/app/components/homePage/detail-role/DetailDescription";
import DetailHeader from "@/app/components/homePage/detail-role/DetailHeader";
import CompanyDetail from "@/app/components/homePage/listPerusahaan/detail-perusahaan/CompanyDetail";
import { Container } from "@/app/components/Container";
import JobCard from "@/app/components/homePage/jobCard";
import { ArrowRight } from "lucide-react";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";
import { IoIosArrowRoundBack } from "react-icons/io";

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

export default function DetailPerusahaanPage() {
  const { id } = useParams();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getCompanyById(id as string);
      if (data && data.jobs?.length) {
        const base = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
        data.jobs = data.jobs.map((j) => {
          let logo = j.perusahaan?.logo_perusahaan ?? null;
          if (logo && !/^https?:\/\//i.test(logo)) {
            logo = base.replace(/\/$/, "") + "/" + logo.replace(/^\//, "");
          }
          return {
            ...j,
            perusahaan: {
              ...j.perusahaan,
              logo_perusahaan: logo,
            },
          };
        });
      }
      setCompany(data ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <>
        <HeaderHome />
        <main>
          <FullPageLoader label="Memuat detail perusahaan" />
        </main>
        <Footer />
      </>
    );

  if (!company)
    return <p className="text-center py-10">Data perusahaan tidak ditemukan</p>;

  return (
    <>
      <HeaderHome />
      <main>
        <Container className="py-6">
          {/* Tombol kembali */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-1 text-black shadow-none px-0 py-0"
            aria-label="Kembali"
            title="Kembali"
          >
            <IoIosArrowRoundBack size={28} />
            <span className="text-xl font-semibold">Kembali</span>
          </button>

          <DetailHeader
            name={company.name}
            logo={company.logoUrl ?? undefined}
          />
          <CompanyDetail totalLowongan={company.totalLowongan} />
          <DetailDescription
            type="organisasi"
            title="Deskripsi Perusahaan"
            description={company.description ?? "-"}
            email={company.email ?? "-"}
            address={company.address ?? "-"}
          />

          <div className="mt-10 text-center mb-10">
            <h3>Temukan Posisi Magang Impianmu Di sini</h3>
            <p>MAVOKA memberikan kesempatan bagi siswa SMK untuk belajar langsung dan mendapatkan pengalaman nyata di dunia industri melalui program magang kami.</p>
          </div>

          {company.jobs && company.jobs.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Lowongan <span className="text-[#0F67B1]">Aktif</span>
                </h2>

                <a
                  href="/lowongan"
                  className="text-[#0F67B1] hover:underline flex items-center gap-1"
                >
                  Semua lowongan <ArrowRight size={20} />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {company.jobs.map((job: Job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    companyLogo={job.perusahaan?.logo_perusahaan ?? null}
                    title={job.judul_lowongan}
                    company={job.perusahaan.nama_perusahaan}
                    location={job.lokasi_penempatan}
                    positions={job.kuota}
                    closingDate={job.deadline_lamaran}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-5">
              Belum ada lowongan lain dari perusahaan ini
            </p>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
