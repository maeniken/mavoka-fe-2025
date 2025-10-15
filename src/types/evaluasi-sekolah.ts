export type StudentEvalListItem = {
  id: string;
  name: string;
  periodLabel: string;
  major: string;
  company: string;
  finalScore: number | null; // bisa null kalau belum ada
};
