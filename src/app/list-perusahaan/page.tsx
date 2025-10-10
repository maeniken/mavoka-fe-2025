"use client";

import { Suspense } from "react";
import HeaderHome from "@/app/components/homePage/headerHomepage";
import PerusahaanList from "@/app/components/homePage/listPerusahaan/companyList";
import "aos/dist/aos.css";
import Footer from "../components/homePage/footer";

export default function HomePage() {
  return (
    <>
      <HeaderHome />
      <main>
        <Suspense fallback={<p className="text-center py-10">Loading perusahaan...</p>}>
          <PerusahaanList />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
