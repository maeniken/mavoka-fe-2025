"use client";

import { Suspense } from "react";
import HeaderHome from "@/app/components/homePage/headerHomepage";
import Footer from "@/app/components/homePage/footer";
import LpkList from "@/app/components/homePage/listLpk/lpkList";

export default function LpkPage() {
  return (
    <>
      <HeaderHome />
      <Suspense fallback={<div>Loading LPK...</div>}>
        <LpkList />
      </Suspense>
      <Footer />
    </>
  );
}
