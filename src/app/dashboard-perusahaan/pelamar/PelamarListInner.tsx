"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApplicants } from "@/lib/mock-pelamar";
import type { Applicant, InterviewPayload } from "@/types/pelamar";

import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import Filter from "@/app/components/dashboard/perusahaan/data-pelamar/filter";
import Table from "@/app/components/dashboard/perusahaan/data-pelamar/table";
import ApplicantsSkeleton from "@/app/components/dashboard/perusahaan/data-pelamar/ApplicantsSkeleton";
import InterviewModal from "@/app/components/dashboard/perusahaan/data-pelamar/interviewModal";
import Pagination from "@/app/components/dashboard/Pagination";
import SuccessModal from "@/app/components/registrasi/PopupBerhasil";

export default function PelamarListInner() {
  const {
    loading,
    positions,
    items,
    totalPages,
    page,
    perPage,
    setPage,
    setPerPage,
    posisiId,
    status,
    setFilterPosisi,
    setFilterStatus,
    onInterview,
    onAccept,
    onReject,
    error,
    reload,
  } = useApplicants();

  const search = useSearchParams();
  const buildDetailHref = (id: string) => {
    const qs = search.toString();
    return qs
      ? `/dashboard-perusahaan/pelamar/${id}?${qs}`
      : `/dashboard-perusahaan/pelamar/${id}`;
  };

  const [openInterview, setOpenInterview] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [offerLoadingId, setOfferLoadingId] = useState<string | null>(null);

  function handleInterviewClick(a: Applicant) {
    setSelectedApplicant(a);
    setOpenInterview(true);
  }

  async function handleInterviewSubmit(payload: InterviewPayload) {
    if (!selectedApplicant) return;
    await onInterview(selectedApplicant.id, payload);
    setOpenInterview(false);
    setSuccessMsg("Informasi Pelaksanaan Interview berhasil dikirim!");
    setSuccessOpen(true);
  }

  async function handleAccept(id: string) {
    // Show loading only for transition wawancara -> penawaran
    const current = items.find((x) => x.id === id)?.status;
    const isOffer = current === "wawancara";
    if (isOffer) setOfferLoadingId(id);
    try {
      await onAccept(id);
    } finally {
      if (isOffer) setOfferLoadingId(null);
    }
    //setSuccessMsg("Pelamar telah Diterima.");
    //setSuccessOpen(true);
  }

  async function handleReject(id: string) {
    await onReject(id);
    //setSuccessMsg("Pelamar telah Ditolak.");
    //setSuccessOpen(true);
  }

  return (
    <DashboardLayout2 role="perusahaan">
      <div className="w-full p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Data Pelamar Magang</h3>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {/* Filter */}
          <Filter
            positions={positions}
            posisiId={posisiId}
            status={status}
            onChangePosisi={setFilterPosisi}
            onChangeStatus={setFilterStatus}
          />

          {/* Tabel scroll */}
          <div
            className="mt-3 overflow-auto rounded-xl"
            style={{
              maxHeight: "calc(100vh - 280px)",
            }}
          >
            {loading && <ApplicantsSkeleton rows={8} />}
            {!loading && error && (
              <div className="p-6 text-center text-sm text-red-600 space-y-3">
                <p className="font-medium">Gagal memuat data pelamar.</p>
                <p className="text-xs text-red-500 break-words max-w-2xl mx-auto">{error}</p>
                {error.includes('401') && (
                  <div className="text-xs text-red-500 space-y-2 max-w-xl mx-auto bg-red-50 border border-red-200 p-3 rounded-md text-left">
                    <p className="font-semibold text-red-600">Langkah perbaikan:</p>
                    <ol className="list-decimal list-inside space-y-1 text-red-700">
                      <li>Login sebagai akun Perusahaan terlebih dahulu.</li>
                      <li>Pastikan response login mengandung token JWT.</li>
                      <li>Simpan token: <code>setAuthToken(token)</code> (frontend sudah disiapkan).</li>
                      <li>Reload halaman ini atau klik tombol Coba Lagi.</li>
                    </ol>
                    <p className="text-[10px] text-red-400">Jika sudah login tapi tetap 401, cek apakah token expired atau header Authorization terkirim di Network tab.</p>
                  </div>
                )}
                <button
                  onClick={reload}
                  className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                >
                  Coba Lagi
                </button>
              </div>
            )}
            {!loading && !error && (
              <Table
                data={items}
                onInterviewClick={handleInterviewClick}
                onAccept={handleAccept}
                onReject={handleReject}
                buildDetailHref={buildDetailHref}
                offerLoadingId={offerLoadingId}
              />
            )}
          </div>

          {/* Pager */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        perPageOptions={[5, 10, 20]}
      />
        </div>

        <InterviewModal
          open={openInterview}
          onClose={() => setOpenInterview(false)}
          applicant={selectedApplicant}
          onSubmit={handleInterviewSubmit}
        />
        <SuccessModal
          open={successOpen}
          title="Berhasil"
          message={successMsg}
          onClose={() => setSuccessOpen(false)}
          duration={1800}
        />
      </div>
    </DashboardLayout2>
  );
}
