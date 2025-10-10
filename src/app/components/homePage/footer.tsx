"use client";
import Image from "next/image";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Container } from "@/app/components/Container"; // ✅ pakai Container

export default function Footer() {
  return (
    <footer>
      <div className="bg-[#D9ECFB]">
        <Container className="py-8">
          <div className="flex flex-col desktop:flex-row desktop:items-start desktop:justify-between gap-10">
            {/* Kiri */}
            <div className="max-w-[520px] text-center tablet:mx-auto desktop:text-left">
              <div className="flex items-center justify-center desktop:justify-start gap-2">
                <Image
                  src="/img/logo-fit-academy.png"
                  alt="FitAcademy"
                  width={55}
                  height={56}
                />
                <Image
                  src="/img/logo-mavoka.png"
                  alt="Mavoka"
                  width={125}
                  height={38}
                  className="-mt-2"
                />
              </div>

              <p className="text-black mt-4 mb-6">
                MAVOKA platform pemagangan terintegrasi <br /> untuk siswa SMK
                di seluruh Indonesia.
              </p>

              <div className="flex justify-center desktop:justify-start gap-3">
                {[
                  { Icon: Facebook, href: "#" },
                  { Icon: Linkedin, href: "#" },
                  { Icon: Instagram, href: "#" },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="p-2 rounded-full bg-[#2B78BA] hover:bg-blue-500 transition-colors"
                    aria-label={`Sosial ${i}`}
                  >
                    <Icon className="text-white" size={18} />
                  </a>
                ))}
              </div>
            </div>
                
            <div className="w-full desktop:flex-1 desktop:flex desktop:justify-end">
              <div className="grid grid-cols-2 tablet:grid-cols-3 gap-8 desktop:gap-12 text-left">
                <div>
                  <h3 className="text-black font-semibold mb-4 tablet:mb-6">
                    Tautan Cepat
                  </h3>
                  <ul className="space-y-2 text-black text-sm">
                    <li>
                      <a href="/">Beranda</a>
                    </li>
                    <li>
                      <a href="/tentang-mavoka">Tentang MAVOKA</a>
                    </li>
                    <li>
                      <a href="/lowongan">Cari lowongan</a>
                    </li>
                    <li>
                      <a href="/list-perusahaan">Perusahaan</a>
                    </li>
                    <li>
                      <a href="/lpk">Lembaga Pelatihan</a>
                    </li>
                    <li>
                      <a href="/sekolah">Sekolah</a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-black font-semibold mb-4 tablet:mb-6">
                    Pusat Bantuan
                  </h3>
                  <ul className="space-y-2 text-black text-sm">
                    <li>
                      <a href="/customer-support">Dukungan Pelanggan</a>
                    </li>
                    <li>
                      <a href="/privacy-policy">Kebijakan Privasi</a>
                    </li>
                    <li>
                      <a href="/faq">Panduan & FAQ</a>
                    </li>
                  </ul>
                </div>

                <div className="col-span-2 tablet:col-span-1">
                  <h3 className="text-black font-semibold mb-4 tablet:mb-6">
                    Alamat Kami
                  </h3>
                  <p className="text-black text-sm">
                    Jl. Kembang Baru No.10 55281
                    <br />
                    Maguwoharjo
                    <br />
                    Daerah Istimewa Yogyakarta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div
        className="text-white text-sm py-3 text-center"
        style={{
          background: "linear-gradient(135deg, #52E5E7 2%, #130CB7 98%)",
        }}
      >
        © Copyright 2025, All Rights Reserved by Fitinline
      </div>
    </footer>
  );
}
