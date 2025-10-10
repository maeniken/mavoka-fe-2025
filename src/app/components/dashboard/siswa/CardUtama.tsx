"use client";

import { useEffect, useState } from "react";

interface AnyUser { [k:string]: any }

function deriveNama(user: AnyUser | null): string {
  if (!user) return "Siswa";
  return (
    user.nama_lengkap ||
    user.name ||
    user.username ||
    "Siswa"
  );
}

export default function CardUtama() {
  const [nama, setNama] = useState<string>("Siswa");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setNama(deriveNama(parsed));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  return (
    <div className="flex-1 h-full p-6">
      <div className="bg-white rounded-lg shadow p-10 h-full flex flex-col items-start justify-start">
        <h1 className="font-bold text-[#0F67B1]">
          SELAMAT DATANG <span className="text-black">{nama}</span>
        </h1>
        <p className="text-[#A3A3A3] mt-1">
          Hi, {nama}. Selamat datang kembali di MAVOKA!
        </p>
        <p className="mt-10 font-semibold">
          Selamat datang di dashboard siswa. Silahkan gunakan fitur di samping
          untuk keperluan Anda.
        </p>
        <p className="font-semibold">Let's Start Your Career Here!</p>
      </div>
    </div>
  );
}

