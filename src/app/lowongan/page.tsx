"use client";

import { Suspense } from "react";
import HeaderHome from "../components/homePage/headerHomepage";
import { SearchLowonganBar } from "@/app/components/homePage/cari-lowongan/SearchLowonganBar";
import CariLowonganResult from "../components/homePage/cari-lowongan/cariLowongan";
import Footer from "../components/homePage/footer";

export default function CariLowonganPage() {
  return (
    <>
      <HeaderHome />
      <section className="py-5 text-center">
        <h2>
          Temukan Tempat Magang <br /> Impianmu di sini
        </h2>
      </section>

      <Suspense fallback={<div>Loading pencarian...</div>}>
        <SearchLowonganBar />
      </Suspense>

      <Suspense fallback={<div>Loading hasil...</div>}>
        <CariLowonganResult />
      </Suspense>

      <Footer />
    </>
  );
}
