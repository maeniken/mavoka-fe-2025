//"use client";

//import { useEffect, useState } from "react";
//import CompanyCard from "./companyCard";
//import { ArrowRight } from "lucide-react";
//import { Container } from "@/app/components/Container";

//type Perusahaan = {
//  id: number;
//  nama_perusahaan: string;
//  logo_perusahaan: string | null;
//  status_verifikasi: string;
//};

//export default function CompanyList() {
//  const [companies, setCompanies] = useState<Perusahaan[]>([]);

//  useEffect(() => {
//    const fetchCompanies = async () => {
//      try {
//        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
//        const response = await fetch(`${API_BASE_URL}/api/user/show-akun/perusahaan`);
//        const json = await response.json();
//        const verified = json.data.filter(
//          (item: Perusahaan) => item.status_verifikasi === "Terverifikasi"
//        );
//        setCompanies(verified);
//      } catch (error) {
//        console.error("Gagal mengambil data perusahaan:", error);
//      }
//    };

//    fetchCompanies();
//  }, []);

//  return (
//    <section className="bg-blue-100 py-10">
//      <Container>
//        {/* Header */}
//        <div className="flex justify-between items-center mb-6">
//          <h2 className="text-xl font-semibold">
//            List <span className="text-[#0F67B1]">Perusahaan</span>
//          </h2>

//          <a
//            href="/list-perusahaan"
//            className="text-[#0F67B1] hover:underline flex items-center gap-1"
//          >
//            Semua perusahaan <ArrowRight size={20} />
//          </a>
//        </div>

//        {/* Grid */}
//        <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 gap-6">
//          {companies.slice(0, 8).map((company) => (
//            <CompanyCard
//              key={company.id}
//              logo={company.logo_perusahaan || null}
//              name={company.nama_perusahaan}
//              detailLink={`/list-perusahaan/${company.id}`}
//            />
//          ))}
//        </div>
//      </Container>
//    </section>
//  );
//}


"use client";

import { useEffect, useState } from "react";
import CompanyCard from "./companyCard";
import CompanyCardSkeleton from "./companyCardSkeleton";
import { ArrowRight } from "lucide-react";
import { Container } from "@/app/components/Container";

type Perusahaan = {
  id: number;
  nama_perusahaan: string;
  logo_perusahaan: string | null;
  status_verifikasi: string;
};

export default function CompanyList() {
  const [companies, setCompanies] = useState<Perusahaan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
        const response = await fetch(`${API_BASE_URL}/api/user/show-akun/perusahaan`);
        const json = await response.json();
        const verified = json.data.filter(
          (item: Perusahaan) => item.status_verifikasi === "Terverifikasi"
        );
        setCompanies(verified);
      } catch (error) {
        console.error("Gagal mengambil data perusahaan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <section className="bg-blue-100 py-10">
      <Container>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            List <span className="text-[#0F67B1]">Perusahaan</span>
          </h2>

          {/* Desktop & Tablet → text + arrow */}
          <a
            href="/list-perusahaan"
            className="hidden tablet:flex items-center gap-1 text-[#0F67B1] hover:underline"
          >
            Semua perusahaan <ArrowRight size={20} />
          </a>

          {/* Mobile → arrow only */}
          <a
            href="/list-perusahaan"
            className="tablet:hidden text-[#0F67B1] hover:underline"
          >
            <ArrowRight size={20} />
          </a>
        </div>

        {/* Grid or Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4 gap-6">
            {companies.slice(0, 8).map((company) => (
              <CompanyCard
                key={company.id}
                logo={company.logo_perusahaan || null}
                name={company.nama_perusahaan}
                detailLink={`/list-perusahaan/${company.id}`}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
