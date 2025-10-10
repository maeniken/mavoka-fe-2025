"use client";
import ContactInfoCard from "@/app/components/customer-support/ContactInfoCard";
import GoogleMapEmbed from "@/app/components/customer-support/GoogleMapEmbed";
import FeedbackForm from "@/app/components/customer-support/FeedbackForm";
import HeaderHome from "@/app/components/homePage/headerHomepage";
import Footer from "@/app/components/homePage/footer";
import { Container } from "../components/Container";

export default function CustomerSupportPage() {
  return (
    <>
      <HeaderHome />
      <Container>
        <section className="text-center pt-3 pb-4">
          <h1 className="text-[#0F67B1] text-[20px] tablet:text-[24px] desktop:text-[28px] leading-tight">
            Dukungan Pengguna
          </h1>
          <p className="mt-1 text-[#717171] font-medium text-sm tablet:text-base">
            Ada pertanyaan atau komentar? Tulis pesan saja!
          </p>
        </section>

        <div className="pt-2 ">
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <ContactInfoCard />
            <GoogleMapEmbed />
          </div>

          <FeedbackForm />
        </div>
      </Container>
      <Footer />
    </>
  );
}
