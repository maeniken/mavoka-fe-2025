"use client";

import React, { useEffect, useState } from "react";

interface UserData {
  id: number | string;
  tanggal: string;
  username: string;
  email: string;
  link: string;
  role: string;
  label: string;  
}

export default function StatusVerifikasiTable() {
  const [roleFilter, setRoleFilter] = useState("Semua");
  // Default to show both, but sorting will put unverified ('Belum') first
  const [labelFilter, setLabelFilter] = useState("Semua");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Array<number | string>>([]);

  useEffect(() => {
    // Helper to format ISO timestamps like 2025-09-23T11:16:59.000000Z
    const formatDate = (iso: string) => {
      if (!iso) return "";
      try {
        // Some timestamps may include microseconds; Date can parse the ISO string with Z
        const d = new Date(iso);
        if (isNaN(d.getTime())) return iso;
        return d.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return iso;
      }
    };
    let mounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Try endpoints in order: relative (works if you setup a dev proxy),
      // then NEXT_PUBLIC_API_BASE if developer provided it, then common hosts.
      const tried: string[] = [];
      const envBase = typeof process !== 'undefined' && (process.env as any).NEXT_PUBLIC_API_BASE;
      // When developing locally try the debug endpoint (no auth) first so devs
      // without admin token can still see sample data. Then try explicit backend
      // addresses before falling back to relative path (which may hit Next dev server).
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const tryUrls: string[] = [];

      if (isLocal) {
        // try debug endpoint on same origin first
        tryUrls.push('/api/admin/verifikasi-debug');
        // also try on common backend host
        tryUrls.push('http://localhost:8000/api/admin/verifikasi-debug');
      }

      if (envBase) tryUrls.push(`${envBase.replace(/\/$/, '')}/api/admin/verifikasi`);
      tryUrls.push('http://localhost:8000/api/admin/verifikasi');
      tryUrls.push('http://127.0.0.1:8000/api/admin/verifikasi');
      tryUrls.push('http://localhost:8080/api/admin/verifikasi');
      tryUrls.push('/api/admin/verifikasi');

      try {
        let json: any = null;
        let success = false;

        // gather token from common localStorage keys used by the app
        const maybeToken =
          (typeof window !== 'undefined' && (localStorage.getItem('access_token_admin') || localStorage.getItem('access_token') || localStorage.getItem('token_admin'))) ||
          null;

        const defaultHeaders: Record<string, string> = {
          Accept: 'application/json',
        };

        if (maybeToken) {
          defaultHeaders['Authorization'] = `Bearer ${maybeToken}`;
        }

        for (const url of tryUrls) {
          try {
            tried.push(url);
            const res = await fetch(url, { signal: controller.signal, headers: defaultHeaders });
            if (!res.ok) {
              // If 404 try next fallback; otherwise throw
              if (res.status === 404) continue;
              if (res.status === 401 || res.status === 403) {
                throw new Error(`Unauthorized (HTTP ${res.status}) - pastikan Anda sudah login sebagai admin dan token ada di localStorage`);
              }
              throw new Error(`HTTP ${res.status}`);
            }
            json = await res.json();
            success = true;
            console.debug('StatusVerifikasiTable: fetched data from', url);
            break;
          } catch (innerErr) {
            // If the request was aborted (component unmounted or HMR), stop silently.
            if ((innerErr as any)?.name === 'AbortError') {
              console.debug('StatusVerifikasiTable: fetch aborted');
              return; // exit fetchData gracefully
            }
            // otherwise keep trying other URLs
            console.warn(`Fetch attempt failed for ${url}:`, innerErr);
            continue;
          }
        }

        if (!json) throw new Error(`No data (attempted: ${tried.join(', ')})`);

        // Accept either { data: [...] } or raw array
        const items = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];

        const mapped: UserData[] = items.map((it: any) => ({
          id: it.id,
          tanggal: formatDate(it.tanggal ?? it.created_at ?? ""),
          username: it.username ?? it.name ?? it.nama ?? "",
          email: it.email ?? "",
          link: it.link ?? it.website ?? "",
          role: it.role ?? it.jenis ?? "",
          label:
            it.label ??
            (it.status_verifikasi
              ? (String(it.status_verifikasi).toLowerCase() === "belum" ? "Belum" : "Sudah")
              : "Belum"),
        }));

        // Explicitly exclude Siswa from admin verification table (backend should also exclude)
        const withoutSiswa = mapped.filter((row) => row.role !== "Siswa");

        // Sort so that 'Belum' appears first, then by tanggal desc
        withoutSiswa.sort((a, b) => {
          if (a.label === b.label) return 0;
          if (a.label === "Belum") return -1;
          if (b.label === "Belum") return 1;
          return 0;
        });

        if (mounted) setData(withoutSiswa);
      } catch (err: any) {
        console.error("Failed to fetch verifikasi data:", err);
        if (mounted) {
          // Show attempted urls to help debugging local 404s
          const msg = err.message ? err.message : "Gagal mengambil data";
          setError(`${msg} (attempted: ${tried.join(', ')})`);
          setData([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  // Apply filters to the data (fetched only). Default labelFilter is 'Belum' so
  // unverified items are shown first, but selecting 'Semua' will show both.
  const filteredData = data.filter((item) => {
    return (
      (roleFilter === "Semua" || item.role === roleFilter) &&
      (labelFilter === "Semua" || item.label === labelFilter)
    );
  });

  // Helper: map displayed role to route role key expected by backend
  const roleToRouteKey = (role: string) => {
    const map: Record<string, string> = {
      'Sekolah': 'sekolah',
      'Perusahaan': 'perusahaan',
      'Lembaga Pelatihan': 'lpk',
    };
    return map[role] ?? role.toLowerCase();
  };

  // Verify a user by calling the backend PUT /api/verifikasi/{role}/{id}
  const verifyUser = async (user: UserData) => {
    if (!confirm(`Verifikasi akun ${user.username}?`)) return;

    const roleKey = roleToRouteKey(user.role);
    const id = user.id;

    // gather token
    const maybeToken =
      (typeof window !== 'undefined' && (localStorage.getItem('access_token_admin') || localStorage.getItem('access_token') || localStorage.getItem('token_admin'))) ||
      null;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (maybeToken) headers['Authorization'] = `Bearer ${maybeToken}`;

    // try base urls similar to fetchData ordering
    const envBase = typeof process !== 'undefined' && (process.env as any).NEXT_PUBLIC_API_BASE;
    const putUrls = [
      ...(envBase ? [`${envBase.replace(/\/$/, '')}/api/verifikasi/${roleKey}/${id}`] : []),
      `http://localhost:8000/api/verifikasi/${roleKey}/${id}`,
      `http://127.0.0.1:8000/api/verifikasi/${roleKey}/${id}`,
      `/api/verifikasi/${roleKey}/${id}`,
    ];

    let lastErr: any = null;
    // mark pending
    setPendingIds((p) => [...p, id]);
    for (const url of putUrls) {
      try {
        const res = await fetch(url, { method: 'PUT', headers });
        if (!res.ok) {
          if (res.status === 404) continue;
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${text}`);
        }

        // Success: update local data to mark verified
        setData((prev) => prev.map((d) => (d.id === user.id ? { ...d, label: 'Sudah' } : d)));
        alert('Akun berhasil diverifikasi.');
        // remove pending id
        setPendingIds((p) => p.filter((x) => x !== id));
        return;
      } catch (e) {
        lastErr = e;
        console.warn('Verify attempt failed for', url, e);
        continue;
      }
    }

    // remove pending id
    setPendingIds((p) => p.filter((x) => x !== id));
    alert('Gagal memverifikasi akun: ' + (lastErr?.message ?? 'unknown'));
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      {error && (
        <div className="mb-4 text-sm text-red-600">
          Gagal memuat data: {error}
        </div>
      )}
      <div className="flex gap-4 mb-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-center hover:cursor-pointer"
        >
          <option value="Semua">Semua</option>
          <option value="Perusahaan">Perusahaan</option>
          <option value="Lembaga Pelatihan">Lembaga Pelatihan</option>
          <option value="Sekolah">Sekolah</option>
        </select>

        <select
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-center hover:cursor-pointer"
        >
          <option value="Semua">Semua</option>
          <option value="Belum">Belum</option>
          <option value="Sudah">Sudah</option>
        </select>
      </div>

      <div className="overflow-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#0F67B1] text-white text-center text-xs font-bold">
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Link Website</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? // Render 6 skeleton rows while loading
                Array.from({ length: 6 }).map((_, rIndex) => (
                  <tr
                    key={`skeleton-${rIndex}`}
                    className="text-xs text-center"
                  >
                    <td className="px-4 py-3 border-t">
                      <div className="h-4 bg-gray-200 rounded w-6 mx-auto animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t">
                      <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t text-left">
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t text-left">
                      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t">
                      <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t">
                      <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t">
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                    </td>
                    <td className="px-4 py-3 border-t">
                      <div className="h-8 bg-gray-200 rounded w-24 mx-auto animate-pulse" />
                    </td>
                  </tr>
                ))
              : currentData.map((item, index) => (
                  <tr
                    key={startIndex + index}
                    className="hover:bg-gray-50 text-xs text-center"
                  >
                    <td className="px-4 py-2 border-t">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 py-2 border-t">{item.tanggal}</td>
                    <td className="px-4 py-2 border-t text-left">
                      {item.username}
                    </td>
                    <td className="px-4 py-2 border-t text-left">
                      {item.email}
                    </td>
                    <td className="px-4 py-2 border-t">
                      <a
                        className="text-xs underline"
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.link}
                      </a>
                    </td>
                    <td className="px-4 py-2 border-t">{item.role}</td>
                    <td className="px-4 py-2 border-t">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.label === "Belum"
                            ? "bg-[#FFE0E0] text-[#D30000]"
                            : "bg-[#CDFFCD] text-[#007F00]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-t text-center">
                      {item.label === "Belum" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            className="px-3 py-1 rounded-lg bg-[#28A745] text-white hover:bg-green-500 transition disabled:opacity-50"
                            onClick={() => verifyUser(item)}
                            disabled={pendingIds.includes(item.id)}
                          >
                            {pendingIds.includes(item.id)
                              ? "Memverifikasi..."
                              : "Verifikasi"}
                          </button>
                          <button
                            className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            onClick={() =>
                              console.log(`Tolak: ${item.username}`)
                            }
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1 rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                        >
                          Sudah
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="py-2 px-3 flex items-center gap-4 mt-4 text-xs rounded-b-xl justify-between">
        <div className="flex items-center">
          <div className="text-sm text-gray-600">
            Menampilkan {filteredData.length} hasil
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-700 text-center hover:cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>
              {startIndex + 1}-
              {Math.min(startIndex + rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded bg-white ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                &lt;
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 rounded bg-white ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-800 hover:bg-gray-200"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
