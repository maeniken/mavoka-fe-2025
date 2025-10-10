"use client";

import { Suspense } from "react";
import HeaderHome from "@/app/components/homePage/headerHomepage";
import Footer from "@/app/components/homePage/footer";
import SchoolList from "@/app/components/homePage/listSekolah/schoolList";

export default function SekolahPage() {
  return (
    <>
      <HeaderHome />
      <Suspense fallback={<div>Loading sekolah...</div>}>
        <SchoolList />
      </Suspense>
      <Footer />
    </>
  );
}
