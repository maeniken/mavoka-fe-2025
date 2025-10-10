"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { reportService } from "@/services/laporan-siswa";
import type { ReportState } from "@/types/laporan-siswa";

type Ctx = {
  state: ReportState;
  addWeek: () => void;
  addLog: (weekId: string, log: any) => void;
  finalizeWeek: (weekId: string, days: 5 | 6 | 7) => void;
  setCoverPhoto: (weekId: string, url: string) => void;
};

const ReportCtx = createContext<Ctx | null>(null);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  // muat state awal dari service (dummy/local store)
  const [state, setState] = useState<ReportState>({ weeks: [] });
  useEffect(() => setState(reportService.getState()), []);

  // tambah minggu (biarkan lewat service jika sudah ada logikanya)
  const addWeek = () => setState(reportService.addWeek());

  // ⬇️ addLog langsung pakai setState agar tidak ada "Cannot find name 'setState'"
  // sekaligus memastikan status minggu jadi "ongoing" jika sebelumnya belum "done"
  const addLog = (weekId: string, log: any) => {
    setState((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w: any) =>
        w.id === weekId
          ? {
              ...w,
              logs: [...(w.logs ?? []), log],
              status: w.status === "done" ? "done" : "ongoing",
            }
          : w
      ),
    }));
  };

  // finalize minggu + simpan jumlah hari aktual (5/6/7)
  const finalizeWeek = (weekId: string, days: 5 | 6 | 7) =>
    setState((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w: any) =>
        w.id === weekId ? { ...w, status: "done", targetDays: days } : w
      ),
    }));

  // opsional: set foto cover secara manual (kalau masih dipakai)
  const setCoverPhoto = (weekId: string, url: string) =>
    setState((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w: any) =>
        w.id === weekId ? { ...w, coverPhotoUrl: url } : w
      ),
    }));

  return (
    <ReportCtx.Provider
      value={{ state, addWeek, addLog, finalizeWeek, setCoverPhoto }}
    >
      {children}
    </ReportCtx.Provider>
  );
}

export function useReport() {
  const ctx = useContext(ReportCtx);
  if (!ctx) throw new Error("useReport must be used within ReportProvider");
  return ctx;
}
