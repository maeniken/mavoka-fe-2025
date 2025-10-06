"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApplicants } from "@/lib/mock-pelamar";
import type { Applicant, InterviewPayload } from "@/types/pelamar";

import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import Filter from "@/app/components/dashboard/perusahaan/data-pelamar/filter";
import Table from "@/app/components/dashboard/perusahaan/data-pelamar/table";
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
    await onAccept(id);
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
            {loading ? (
              <div className="p-6 text-center text-gray-500">Memuat data…</div>
            ) : (
              <Table
                data={items}
                onInterviewClick={handleInterviewClick}
                onAccept={handleAccept}
                onReject={handleReject}
                buildDetailHref={buildDetailHref}
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
