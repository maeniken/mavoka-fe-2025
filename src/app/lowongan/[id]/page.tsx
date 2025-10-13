"use client";

import HeaderHome from "@/app/components/homePage/headerHomepage";
import "aos/dist/aos.css";
import Footer from "@/app/components/homePage/footer";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLowonganById } from "@/services/lowongan";
import { getCompanyById } from "@/services/company";
import { Company } from "@/types/company";
import { Lowongan } from "@/types/lowongan";
import { Container } from "@/app/components/Container";
import LowonganHeader from "@/app/components/homePage/cari-lowongan/detail-lowongan/LowonganHeader";
import DetailDescription from "@/app/components/homePage/detail-role/DetailDescription";
import Persyaratan from "@/app/components/homePage/cari-lowongan/detail-lowongan/Persyaratan";
import Keuntungan from "@/app/components/homePage/cari-lowongan/detail-lowongan/Keuntungan";
import Tugas from "@/app/components/homePage/cari-lowongan/detail-lowongan/Tugas";
import LamarButton from "@/app/components/homePage/cari-lowongan/detail-lowongan/LamarButton";
import JobCard from "@/app/components/homePage/jobCard";
import JobCardSkeleton from "@/app/components/homePage/jobCardSkeleton";
import { ArrowRight } from "lucide-react";
import Kuota from "@/app/components/homePage/cari-lowongan/detail-lowongan/Kuota";
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

export default function DetailLowonganPage() {
  const { id } = useParams();
  const router = useRouter();

  const [lowongan, setLowongan] = useState<Lowongan | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingLowongan, setLoadingLowongan] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [showCount, setShowCount] = useState(8);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getLowonganById(id as string);
        setLowongan(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLowongan(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!lowongan?.perusahaan_id) return;
    (async () => {
      try {
        const data = await getCompanyById(lowongan.perusahaan_id.toString());
        setCompany(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCompany(false);
      }
    })();
  }, [lowongan]);

  useEffect(() => {
    if (!company || !lowongan) return;
    setLoadingRelated(true);
    const list = (company.jobs || [])
      .filter((j) => j.id !== lowongan.id)
      .map((j) => ({
        id: j.id,
        judul_lowongan: j.judul_lowongan,
        posisi: j.posisi,
        kuota: j.kuota,
        lokasi_penempatan: j.lokasi_penempatan,
        deadline_lamaran: j.deadline_lamaran,
        perusahaan: {
          nama_perusahaan: company.name,
          logo_perusahaan: company.logoUrl ?? null,
        },
      }));
    setRelatedJobs(list);
    setLoadingRelated(false);
  }, [company, lowongan]);

  if (loadingLowongan || loadingCompany) {
    return (
      <>
        <HeaderHome />
        <main>
          <FullPageLoader label="Memuat detail lowongan" />
        </main>
        <Footer />
      </>
    );
  }
  if (!lowongan)
    return <p className="text-center py-10">Data lowongan tidak ditemukan</p>;
  if (!company)
    return <p className="text-center py-10">Data perusahaan tidak ditemukan</p>;

  return (
    <>
      <HeaderHome />
      <main>
        <Container className="py-6">
          {/* === Tombol Kembali di atas === */}
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

          <LowonganHeader
            name={lowongan.judul_lowongan}
            subtitle={lowongan.perusahaan?.nama_perusahaan ?? "-"}
          />
          <Kuota value={lowongan.kuota} />
          <DetailDescription
            type="lowongan"
            title="Deskripsi Posisi"
            description={lowongan.deskripsi ?? "-"}
            deadline_lamaran={lowongan.deadline_lamaran ?? "-"}
            address={lowongan.lokasi_penempatan ?? "-"}
          />
          <Tugas tugas={lowongan.tugas ?? []} />
          <Persyaratan persyaratan={lowongan.persyaratan ?? []} />
          <Keuntungan benefit={lowongan.keuntungan ?? []} />
          <LamarButton />
        </Container>

        {/* Section Lowongan lain dari perusahaan yang sama */}
        {relatedJobs.length > 0 && (
          <Container className="py-5 border-t mt-5">
            <div className="text-center mb-10">
              <h3>Temukan Posisi Magang Impianmu Di sini</h3>
              <p>MAVOKA memberikan kesempatan bagi siswa SMK untuk belajar langsung dan mendapatkan pengalaman nyata di dunia industri melalui program magang kami.</p>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                Lowongan <span className="text-[#0F67B1]">Aktif</span>
              </h2>
              <a
                href="/lowongan" /* TODO: ganti ke halaman perusahaan spesifik */
                className="text-sm text-[#0F67B1] flex items-center gap-1"
              >
                Semua lowongan <ArrowRight size={18} />
              </a>
            </div>
            {loadingRelated ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : relatedJobs && relatedJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedJobs.slice(0, showCount).map((job: any) => (
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
                {showCount < relatedJobs.length && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setShowCount((c) => c + 6)}
                      className="px-5 py-2 rounded-md border text-sm font-medium text-[#0F67B1] border-[#0F67B1] hover:bg-[#0F67B1] hover:text-white transition"
                    >
                      Lihat lebih banyak
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </Container>
        )}
      </main>
      <Footer />
    </>
  );
}
