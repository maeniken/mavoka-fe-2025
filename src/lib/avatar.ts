const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const API_ROOT = API_BASE.replace(/\/?api\/?$/i, '');

export function buildAvatarCandidates(raw?: string | null): string[] {
  if (!raw) return [];
  if (raw.startsWith('data:') || /^(https?:)?\/\//i.test(raw)) return [raw];
  const cleaned = raw.replace(/^\/+/, '');
  const root = API_ROOT.replace(/\/$/, '');
  const c: string[] = [];
  if (cleaned.startsWith('storage/')) {
    c.push(`${root}/${cleaned}`);
  } else {
    c.push(`${root}/storage/${cleaned}`);
    c.push(`${root}/${cleaned}`);
  }
  return Array.from(new Set(c));
}

export function resolveFirstAvatar(raw?: string | null): string | undefined {
  return buildAvatarCandidates(raw)[0];
}
