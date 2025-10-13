//'use client';

//import React, { useState } from 'react';
//import SuccessModal from '@/app/components/registrasi/PopupBerhasil';

//type FormState = {
//  nama: string;
//  nisn: string;
//  kelas: string;
//  jurusan: string;
//  tahunAjaran: string;
//  email: string;
//};

//const initialState: FormState = {
//  nama: '',
//  nisn: '',
//  kelas: '',
//  jurusan: '',
//  tahunAjaran: '',
//  email: '',
//};

//const UploadManual: React.FC = () => {
//  const [formData, setFormData] = useState<FormState>(initialState);
//  const [showSuccess, setShowSuccess] = useState(false);

//  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//    const { name, value } = e.target;
//    setFormData((s) => ({ ...s, [name]: value }));
//  };

//  const onSubmit = (e: React.FormEvent) => {
//    e.preventDefault();

//    const missing = Object.values(formData).some((v) => !String(v).trim());
//    if (missing) {
//      alert('Semua kolom harus diisi!');
//      return;
//    }

//    // TODO: kirim ke endpoint ketika tersedia
//    setShowSuccess(true);
//  };

//  const inputCls =
//    'mt-1 w-full rounded-md border border-[#B7B7B7] px-3 py-2 text-sm outline-none ' +
//    'placeholder:text-[#858585] focus:ring-2 focus:ring-blue-200 focus:border-blue-400';

//  return (
//    <div className="space-y-4">
//      {/* Header */}
//      <div>
//        <h2 className="text-[20px] font-semibold text-[#1C1C1C]">Data Siswa</h2>
//        <p className="text-sm text-gray-500">
//          Pastikan informasi data siswa terisi dengan benar.
//        </p>
//      </div>

//      {/* Divider */}
//      <div className="border-t border-gray-200" />

//      {/* Form */}
//      <form onSubmit={onSubmit} className="space-y-4">
//        <div>
//          <label htmlFor="nama" className="block text-sm font-medium text-[#1C1C1C]">
//            Nama Siswa
//          </label>
//          <input
//            id="nama"
//            name="nama"
//            value={formData.nama}
//            onChange={onChange}
//            placeholder="Masukkan nama siswa..."
//            className={inputCls}
//            required
//          />
//        </div>

//        <div>
//          <label htmlFor="nisn" className="block text-sm font-medium text-[#1C1C1C]">
//            NISN
//          </label>
//          <input
//            id="nisn"
//            name="nisn"
//            value={formData.nisn}
//            onChange={onChange}
//            placeholder="Masukkan NISN"
//            className={inputCls}
//            required
//          />
//        </div>

//        <div>
//          <label htmlFor="kelas" className="block text-sm font-medium text-[#1C1C1C]">
//            Kelas
//          </label>
//          <input
//            id="kelas"
//            name="kelas"
//            value={formData.kelas}
//            onChange={onChange}
//            placeholder="Masukkan kelas"
//            className={inputCls}
//            required
//          />
//        </div>

//        <div>
//          <label htmlFor="jurusan" className="block text-sm font-medium text-[#1C1C1C]">
//            Jurusan
//          </label>
//          <input
//            id="jurusan"
//            name="jurusan"
//            value={formData.jurusan}
//            onChange={onChange}
//            placeholder="Masukkan jurusan"
//            className={inputCls}
//            required
//          />
//        </div>

//        <div>
//          <label htmlFor="tahunAjaran" className="block text-sm font-medium text-[#1C1C1C]">
//            Tahun Ajaran
//          </label>
//          <input
//            id="tahunAjaran"
//            name="tahunAjaran"
//            value={formData.tahunAjaran}
//            onChange={onChange}
//            placeholder="Masukkan tahun ajaran"
//            className={inputCls}
//            required
//          />
//        </div>

//        <div>
//          <label htmlFor="email" className="block text-sm font-medium text-[#1C1C1C]">
//            Email
//          </label>
//          <input
//            id="email"
//            type="email"
//            name="email"
//            value={formData.email}
//            onChange={onChange}
//            placeholder="Masukkan Email"
//            className={inputCls}
//            required
//          />
//        </div>

//        {/* Tombol kanan bawah – gaya disamakan dengan Excel */}
//        <div className="flex justify-end pt-2">
//          <button
//            type="submit"
//            className="px-4 py-2 rounded-[5px] bg-[#0F67B1] text-white"
//          >
//            Unggah
//          </button>
//        </div>
//      </form>

//      {/* Success modal – pola pemanggilan disamakan */}
//      <SuccessModal
//        open={showSuccess}
//        onClose={() => {
//          setShowSuccess(false);
//          setFormData(initialState);
//        }}
//        title="Berhasil"
//        message="Data Siswa yang Anda inputkan berhasil diunggah!"
//        duration={2500} // ⬅️ sama seperti Excel
//        // primaryText tidak diisi → tidak menampilkan tombol
//      />
//    </div>
//  );
//};

//export default UploadManual;


'use client';

import React, { useEffect, useState } from 'react';
import SuccessModal from '@/app/components/registrasi/PopupBerhasil';
import { uploadSiswaSingle } from '@/lib/api-unggah-data-siswa';
import { getJurusanBySekolah } from '@/services/sekolah';

type FormState = {
  nama: string;
  nisn: string;
  kelas: string;
  jurusan: string;
  tahunAjaran: string;
  email: string;
};

const initialState: FormState = {
  nama: '',
  nisn: '',
  kelas: '',
  jurusan: '',
  tahunAjaran: '',
  email: '',
};

type Props = {
  sekolahId?: number; // opsional; fallback dari localStorage
};

const UploadManual: React.FC<Props> = ({ sekolahId }) => {
  const [formData, setFormData] = useState<FormState>(initialState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sid, setSid] = useState<number | null>(sekolahId ?? null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jurusanOptions, setJurusanOptions] = useState<string[]>([]);
  const [loadingJurusan, setLoadingJurusan] = useState(false);

function resolveSekolahId(): number | null {
  // 1) prop menang
  if (typeof sekolahId === "number") return sekolahId;

  // 2) id_sekolah (konvensi yang kita set di login)
  const idByRole = typeof window !== "undefined" ? window.localStorage.getItem("id_sekolah") : null;
  if (idByRole && !Number.isNaN(Number(idByRole))) return Number(idByRole);

  // 3) sekolah_id (kalau BE / kode lama pernah set ini)
  const legacy = typeof window !== "undefined" ? window.localStorage.getItem("sekolah_id") : null;
  if (legacy && !Number.isNaN(Number(legacy))) return Number(legacy);

  // 4) actor JSON { role, id } → pakai jika role === 'sekolah'
  const actorRaw = typeof window !== "undefined" ? window.localStorage.getItem("actor") : null;
  if (actorRaw) {
    try {
      const actor = JSON.parse(actorRaw);
      if (actor?.role === "sekolah") {
        const v = actor?.id;
        if (typeof v === "number") return v;
        if (typeof v === "string" && !Number.isNaN(Number(v))) return Number(v);
      }
    } catch {}
  }

  // 5) user.sekolah?.id (kalau backend kirim nested)
  const userRaw = typeof window !== "undefined" ? window.localStorage.getItem("user") : null;
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      const nested = u?.sekolah?.id ?? u?.sekolah_id;
      if (typeof nested === "number") return nested;
      if (typeof nested === "string" && !Number.isNaN(Number(nested))) return Number(nested);
    } catch {}
  }

  return null;
}

// efek: isi sid sekali saat mount/ketika prop berubah
useEffect(() => {
  if (sid != null) return; // sudah ada
  const found = resolveSekolahId();
  if (found != null) setSid(found);
}, [sid, sekolahId]);

// efek: load daftar jurusan ketika sid sudah ada
useEffect(() => {
  if (sid == null) return;
  (async () => {
    try {
      setLoadingJurusan(true);
      const arr = await getJurusanBySekolah(sid);
      const names = Array.isArray(arr) ? arr.map(j => j.nama_jurusan).filter(Boolean) : [];
      setJurusanOptions(names);
    } catch (e) {
      console.warn('[unggah-manual] gagal memuat jurusan', e);
      setJurusanOptions([]);
    } finally {
      setLoadingJurusan(false);
    }
  })();
}, [sid]);


  const onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    const { name, value } = e.currentTarget;
    setFormData((s) => ({ ...s, [name]: value }));
  };

const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // validasi dasar
  const missing = Object.values(formData).some((v) => !String(v).trim());
  if (missing) {
    alert('Semua kolom harus diisi!');
    return;
  }
  if (sid == null) {
    alert('sekolah_id tidak ditemukan. Pastikan user sekolah sudah login.');
    return;
  }

  setLoading(true);
  setErrors({});

  // payload sesuai nama field backend
  const payload = {
    nama_lengkap: formData.nama.trim(),
    nisn: formData.nisn.trim(),
    kelas: formData.kelas.trim(),
    nama_jurusan: formData.jurusan.trim(),
    tahun_ajaran: formData.tahunAjaran.trim(),
    email: formData.email.trim(),
    sekolah_id: sid,
  };

  try {
    console.log('UPLOAD_SINGLE_PAYLOAD =>', payload); // cek cepat di console
    await uploadSiswaSingle(payload);
    setShowSuccess(true);
    setFormData(initialState);
  } catch (err: unknown) {
    const resp = (err as any)?.response?.data as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    console.error('UPLOAD_SINGLE_422 =>', resp);

    // mapping error Laravel ke field
    const bag = resp?.errors || {};
    const mapped: Record<string, string> = {};
    Object.entries(bag).forEach(([k, v]) => {
      if (Array.isArray(v) && v[0]) mapped[k] = v[0];
    });
    setErrors(mapped);

    if (!Object.keys(mapped).length) {
      alert(resp?.message || 'Gagal menyimpan data.');
    }
  } finally {
    setLoading(false);
  }
};


  const inputCls =
    'mt-1 w-full rounded-md border border-[#B7B7B7] px-3 py-2 text-sm outline-none ' +
    'placeholder:text-[#858585] focus:ring-2 focus:ring-blue-200 focus:border-blue-400';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-[20px] font-semibold text-[#1C1C1C]">Data Siswa</h2>
        <p className="text-sm text-gray-500">
          Pastikan informasi data siswa terisi dengan benar.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="nama" className="block text-sm font-medium text-[#1C1C1C]">
            Nama Siswa
          </label>
          <input
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={onChange}
            placeholder="Masukkan nama siswa..."
            className={inputCls}
            required
          />
          {errors.nama_lengkap && <p className="text-xs text-red-600 mt-1">{errors.nama_lengkap}</p>}
        </div>

        <div>
          <label htmlFor="nisn" className="block text-sm font-medium text-[#1C1C1C]">
            NISN
          </label>
          <input
            id="nisn"
            name="nisn"
            value={formData.nisn}
            onChange={onChange}
            placeholder="Masukkan NISN"
            className={inputCls}
            required
          />
          {errors.nisn && <p className="text-xs text-red-600 mt-1">{errors.nisn}</p>}
        </div>

        <div>
          <label htmlFor="kelas" className="block text-sm font-medium text-[#1C1C1C]">
            Kelas
          </label>
          <input
            id="kelas"
            name="kelas"
            value={formData.kelas}
            onChange={onChange}
            placeholder="Masukkan kelas"
            className={inputCls}
            required
          />
          {errors.kelas && <p className="text-xs text-red-600 mt-1">{errors.kelas}</p>}
        </div>

        <div>
          <label htmlFor="jurusan" className="block text-sm font-medium text-[#1C1C1C]">
            Jurusan
          </label>
          {loadingJurusan ? (
            <select
              id="jurusan"
              name="jurusan"
              value={formData.jurusan}
              onChange={onChange}
              className={inputCls}
              disabled
            >
              <option value="">Memuat jurusan…</option>
            </select>
          ) : jurusanOptions.length > 0 ? (
            <select
              id="jurusan"
              name="jurusan"
              value={formData.jurusan}
              onChange={onChange}
              className={inputCls}
              required
            >
              <option value="">Pilih jurusan</option>
              {jurusanOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="jurusan"
              name="jurusan"
              value={formData.jurusan}
              onChange={onChange}
              placeholder="Masukkan jurusan"
              className={inputCls}
              required
            />
          )}
          {errors.nama_jurusan && <p className="text-xs text-red-600 mt-1">{errors.nama_jurusan}</p>}
        </div>

        <div>
          <label htmlFor="tahunAjaran" className="block text-sm font-medium text-[#1C1C1C]">
            Tahun Ajaran
          </label>
          <input
            id="tahunAjaran"
            name="tahunAjaran"
            value={formData.tahunAjaran}
            onChange={onChange}
            placeholder="Masukkan tahun ajaran"
            className={inputCls}
            required
          />
          {errors.tahun_ajaran && <p className="text-xs text-red-600 mt-1">{errors.tahun_ajaran}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1C1C1C]">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Masukkan Email"
            className={inputCls}
            required
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Tombol kanan bawah – gaya disamakan dengan Excel */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-[5px] bg-[#0F67B1] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengunggah...' : 'Unggah'}
          </button>
        </div>
      </form>

      {/* Success modal – pola pemanggilan disamakan */}
      <SuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          setFormData(initialState);
        }}
        title="Berhasil"
        message="Data Siswa yang Anda inputkan berhasil diunggah!"
        duration={2500}
      />
    </div>
  );
};

export default UploadManual;
