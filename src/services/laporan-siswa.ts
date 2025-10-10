import type { ReportState, WeekReport, DayLog } from "@/types/laporan-siswa";
const KEY = "mavoka_report_state_v1";

function read(): ReportState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ReportState) : null;
  } catch {
    return null;
  }
}
function write(state: ReportState) {
  if (typeof window !== "undefined")
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
}
function newWeek(number: number): WeekReport {
  return { id: crypto.randomUUID(), number, logs: [], status: "ongoing" };
}

export const reportService = {
  getState(): ReportState {
    const s = read();
    if (s?.weeks?.length) return s;
    const initial: ReportState = { weeks: [newWeek(1)] };
    write(initial);
    return initial;
  },
  addWeek(): ReportState {
    const s = reportService.getState();
    const next: ReportState = {
      weeks: [...s.weeks, newWeek(s.weeks.length + 1)],
    };
    write(next);
    return next;
  },
  addLog(weekId: string, partial: Omit<DayLog, "id">): ReportState {
    const s = reportService.getState();
    const weeks = s.weeks.map((w) =>
      w.id === weekId
        ? { ...w, logs: [...w.logs, { id: crypto.randomUUID(), ...partial }] }
        : w
    );
    const next: ReportState = { weeks };
    write(next);
    return next;
  },
  finalizeWeek(weekId: string, targetDays: 5 | 6 | 7): ReportState {
    const s = reportService.getState();
    const weeks = s.weeks.map((w) => {
      if (w.id !== weekId) return w;
      const coverPhotoUrl = [...w.logs]
        .reverse()
        .find((l) => l.photoUrl)?.photoUrl;
      return { ...w, status: "done" as const, targetDays, coverPhotoUrl };
    });
    const next: ReportState = { weeks };
    write(next);
    return next;
  },
};
