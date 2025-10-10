"use client";
import { useEffect, useState } from "react";
import SekolahHeader from "@/app/components/dashboard/siswa/pengaturan/sekolah/SekolahHeader";
import SekolahView from "@/app/components/dashboard/siswa/pengaturan/sekolah/SekolahView";
import { getSiswaProfile } from "@/services/siswa";
import { getSchoolById, getJurusanBySekolah } from "@/services/sekolah";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

interface SekolahFormState {
  schoolName: string;
  nisn: string;
  kelas: string;
  jurusan: string;
  tahunAjaran: string;
}

export default function SekolahPage() {
  const [form, setForm] = useState<SekolahFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    let cancelled = false;
    // Hilangkan scroll global selama halaman sekolah ini dibuka
    const prevOverflowY = document.body.style.overflowY;
    document.body.style.overflowY = 'hidden';
    (async () => {
      try {
        setLoading(true);
        // Ambil profil siswa untuk dapatkan relasi sekolah / jurusan / kelas / nisn
        const siswa = await getSiswaProfile();
        if (cancelled) return;
        // Cari sekolah_id dari beberapa kemungkinan field
        const sekolahId = siswa.sekolah_id || siswa.id_sekolah || siswa.school_id || null;
        let schoolName = "-";
        let jurusanNama = siswa.jurusan || siswa.nama_jurusan || "-";
        if (sekolahId) {
          const sekolah = await getSchoolById(sekolahId);
          if (sekolah) schoolName = sekolah.name || schoolName;
          // Jika jurusan siswa kosong, coba fetch list jurusan (opsional)
          if ((!jurusanNama || jurusanNama === '-') && sekolahId) {
            const jurusanList = await getJurusanBySekolah(sekolahId);
            if (jurusanList.length > 0) jurusanNama = jurusanList[0].nama_jurusan;
          }
        }

        const formState: SekolahFormState = {
          schoolName,
          nisn: siswa.nisn || siswa.nis || "-",
          kelas: siswa.kelas || siswa.class_name || "-",
          jurusan: jurusanNama || '-',
          tahunAjaran: siswa.tahun_ajaran || siswa.tahunAjaran || '-',
        };
        if (!cancelled) setForm(formState);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Gagal memuat data sekolah');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { 
      cancelled = true; 
      document.body.style.overflowY = prevOverflowY; // restore
    };
  }, []);

  return (
    <>
      <SekolahHeader />
      {loading && (
        <div className="py-10 flex justify-center"><LoadingSpinner size={48} label="Memuat data sekolah..." labelPosition="below" styleType="dashed" /></div>
      )}
      {error && !loading && (
        <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
      )}
      {!loading && !error && form && <SekolahView form={form} />}
    </>
  );
}
