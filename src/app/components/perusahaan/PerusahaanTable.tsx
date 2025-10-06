"use client";
import React, { useEffect, useState } from 'react';

interface Perusahaan {
  id: number;
  nama_perusahaan: string;
  bidang_usaha?: string;
  deskripsi_usaha?: string;
  penanggung_jawab?: string;
  tanda_tangan?: string;
  tanda_tangan_url?: string;
}

export default function PerusahaanTable() {
  const [data, setData] = useState<Perusahaan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const API_BASE = (process.env.NEXT_PUBLIC_API_BASE as string) || (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000';
      const apiRoot = `${API_BASE.replace(/\/+$/g, '')}/api`;
      try {
        const res = await fetch(`${apiRoot}/perusahaan/all`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        // expect array in json.data or json
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        setData(list);
      } catch (e: any) {
        console.error('fetch perusahaan list error', e);
        setError(e?.message || 'Gagal mengambil daftar perusahaan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Daftar Perusahaan</h3>
      {loading && <div>Memuat...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Nama Perusahaan</th>
                <th className="border p-2 text-left">Bidang Usaha</th>
                <th className="border p-2 text-left">Deskripsi</th>
                <th className="border p-2 text-left">Penanggung Jawab</th>
                <th className="border p-2 text-left">Tanda Tangan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border p-2 align-top">{row.nama_perusahaan}</td>
                  <td className="border p-2 align-top">{row.bidang_usaha ?? '-'}</td>
                  <td className="border p-2 align-top max-w-md">{row.deskripsi_usaha ?? '-'}</td>
                  <td className="border p-2 align-top">{row.penanggung_jawab ?? '-'}</td>
                  <td className="border p-2 align-top">
                    {row.tanda_tangan_url || row.tanda_tangan ? (
                      <img src={row.tanda_tangan_url ?? row.tanda_tangan} alt={`tanda-${row.id}`} className="h-16 object-contain" />
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
