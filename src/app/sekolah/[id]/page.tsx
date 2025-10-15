"use client";

import HeaderHome from "@/app/components/homePage/headerHomepage";
import "aos/dist/aos.css";
import Footer from "@/app/components/homePage/footer";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSchoolById, getJurusanBySekolah } from "@/services/sekolah";
import { School } from "@/types/school";
import DetailDescription from "@/app/components/homePage/detail-role/DetailDescription";
import DetailHeader from "@/app/components/homePage/detail-role/DetailHeader";
import KompetensiKeahlian from "@/app/components/homePage/listSekolah/detail-sekolah/KompetensiKeahlian";
import { Container } from "@/app/components/Container";
import { FullPageLoader } from "@/app/components/ui/LoadingSpinner";
import { IoIosArrowRoundBack } from "react-icons/io";

export default function DetailSekolahPage() {
  const { id } = useParams();
  const router = useRouter();

  const [sekolah, setSekolah] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [schoolData, jurusan] = await Promise.all([
          getSchoolById(id as string),
          getJurusanBySekolah(id as string),
        ]);
        if (schoolData) {
          // jika schoolData.jurusan kosong, isi dari endpoint jurusan
          schoolData.jurusan =
            schoolData.jurusan && schoolData.jurusan.length > 0
              ? schoolData.jurusan
              : jurusan;
        }
        setSekolah(schoolData);
      } catch (error) {
        console.error("Gagal fetch data Sekolah:", error);
        setSekolah(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const logoSrc = useMemo(() => {
    if (!sekolah) return "/img/sejarah-mavoka.png"; // fallback global
    return sekolah.logoUrl || "/img/sejarah-mavoka.png";
  }, [sekolah]);

  if (loading)
    return (
      <>
        <HeaderHome />
        <main>
          <FullPageLoader label="Memuat detail sekolah" />
        </main>
        <Footer />
      </>
    );

  if (!sekolah)
    return <p className="text-center py-10">Data sekolah tidak ditemukan</p>;

  return (
    <>
      <HeaderHome />
      <main>
        <Container className="py-6">
          {/* Tombol Kembali */}
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

          <DetailHeader name={sekolah.name} logo={logoSrc} />
          <DetailDescription
            type="sekolah"
            email={sekolah.email ?? "-"}
            address={sekolah.address ?? "-"}
            npsn={sekolah.npsn ?? "-"}
            website={sekolah.website ?? "-"}
          />
          <KompetensiKeahlian jurusan={sekolah.jurusan} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
