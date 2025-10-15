"use client";

import { useEffect, useState } from "react";
import StudentApplicationsTable from "@/app/components/dashboard/siswa/pengajuan-magang/table";

interface AnyUser {
  [k: string]: any;
}
function deriveNama(user: AnyUser | null): string {
  if (!user) return "Siswa";
  return user.nama_lengkap || user.name || user.username || "Siswa";
}

export default function CardUtama() {
  const [nama, setNama] = useState<string>("Siswa");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setNama(deriveNama(JSON.parse(raw)));
    } catch {}
  }, []);

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6 sm:p-8 lg:p-10 flex flex-col items-start justify-start">
        <h1 className="font-bold text-[#0F67B1]">SELAMAT DATANG</h1>
        <p className="text-[#A3A3A3] mt-1">
          Hi, {nama}. Selamat datang kembali di MAVOKA!
        </p>
        <p className="mt-8 font-semibold">
          Selamat datang di dashboard siswa. Silahkan gunakan fitur di samping
          untuk keperluan Anda.
        </p>
        <p className="font-semibold">Let's Start Your Career Here!</p>

        <p className="mt-8 mb-3 w-full text-center font-semibold">
          Daftar Lowongan Dilamar
        </p>

        <div className="w-full overflow-x-auto">
          <StudentApplicationsTable
            showActions={false}
            showCv={false}
            showTranskrip={false}
            withCard={false}
            stretch
          />
        </div>
      </div>
    </div>
  );
}
