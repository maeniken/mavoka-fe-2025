//import HeaderHome from "../components/homePage/headerHomepage";
//import { HeroFaq } from "@/app/components/homePage/faq/faqHero";
////import { UserGuidesGrid } from "@/app/components/homePage/panduanPengguna/userGuideGrid";
//import { FAQ } from "@/app/components/homePage/tentang-kami/faq";
//import Footer from "@/app/components/homePage/footer";

//export default function FAQPage() {
//  return (
//    <>
//      <HeaderHome />
//       <HeroFaq
//        title="Panduan & FAQ"
//        imageSrc="/img/GAMBAR-PERUSAHAAN.png" // pastikan ada gambar ini di public/images
//      />
//      {/*<UserGuidesGrid />*/}

//      <FAQ />
//      <Footer />
//    </>
//  );
//}

"use client";

import { useState } from "react";
import HeaderHome from "../components/homePage/headerHomepage";
import { HeroFaq } from "@/app/components/homePage/faq/faqHero";
import { FAQ } from "@/app/components/homePage/tentang-kami/faq";
import Footer from "@/app/components/homePage/footer";

import { RoleSelectorRow } from "@/app/components/homePage/panduanPengguna/RoleSelectorRow";
import { RoleDetailsBlock } from "@/app/components/homePage/panduanPengguna/RoleDetailsBlock";

export default function FAQPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <>
      <HeaderHome />
      <HeroFaq title="Panduan & FAQ" imageSrc="/img/GAMBAR-PERUSAHAAN.png" />

      <RoleSelectorRow
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
      />

      <FAQ />
      <Footer />
    </>
  );
}
