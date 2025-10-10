// Generic username extraction utility for LPK (and potentially other roles)
// Scans multiple common nesting patterns and falls back to a bounded BFS.
export interface UsernameExtractionResult {
  username: string | null;
  path?: string; // debug path to where it was found
}

// Extended key variants including common Indonesian naming variants
const USERNAME_KEYS = [
  'username','user_name','userName','login','nama_pengguna','namaPengguna','akun_username','credential_username'
];

export function extractUsernameFromAny(
  obj: any,
  maxDepth = 5,
  withPath = false,
  options?: { allowEmailHeuristic?: boolean }
): string | null | UsernameExtractionResult {
  if (!obj) return withPath ? { username: null } : null;

  const returnValue = (username: string | null, path?: string) => withPath ? { username, path } : username;

  // Fast direct paths
  const directCandidates: { value: any; path: string }[] = [
    { value: obj.username, path: 'username' },
    { value: obj?.user?.username, path: 'user.username' },
    { value: obj?.data?.username, path: 'data.username' },
    { value: obj?.data?.user?.username, path: 'data.user.username' },
  ];
  for (const c of directCandidates) {
    if (typeof c.value === 'string' && c.value.trim()) return returnValue(c.value.trim(), c.path);
  }

  const domainCandidates = [
    { ref: obj.akun, base: 'akun' },
    { ref: obj.data, base: 'data' },
    { ref: obj.user, base: 'user' },
    { ref: obj.lpk, base: 'lpk' },
    { ref: obj.lpk_data, base: 'lpk_data' },
    { ref: obj.lembaga_pelatihan, base: 'lembaga_pelatihan' },
    { ref: obj.lembagaPelatihan, base: 'lembagaPelatihan' },
    { ref: obj.perusahaan, base: 'perusahaan' },
    { ref: obj.sekolah, base: 'sekolah' },
    { ref: obj.siswa, base: 'siswa' },
  ];
  for (const { ref, base } of domainCandidates) {
    if (!ref || typeof ref !== 'object') continue;
    for (const key of USERNAME_KEYS) {
      const val = (ref as any)[key];
      if (typeof val === 'string' && val.trim()) return returnValue(val.trim(), `${base}.${key}`);
    }
  }

  // Pre-BFS heuristic: look for any string under top-level objects that matches an email-like prefix before @
  // (Sometimes username stored as same as email local-part)
  if (options?.allowEmailHeuristic !== false) {
    if (typeof obj.email === 'string' && obj.email.includes('@')) {
      const local = obj.email.split('@')[0];
      if (local && local.length >= 3) return returnValue(local, 'email(local-part heuristic)');
    }
  }

  // BFS for deeper nested keys
  const visited = new Set<any>();
  const queue: { value: any; depth: number; path: string }[] = [{ value: obj, depth: 0, path: 'root' }];
  while (queue.length) {
    const { value, depth, path } = queue.shift()!;
    if (!value || typeof value !== 'object' || visited.has(value) || depth > maxDepth) continue;
    visited.add(value);
    for (const k of Object.keys(value)) {
      const val: any = (value as any)[k];
      if (typeof val === 'string') {
        if (/username/i.test(k) && val.trim()) return returnValue(val.trim(), `${path}.${k}`);
        // Also attempt key variants list
        if (USERNAME_KEYS.includes(k) && val.trim()) return returnValue(val.trim(), `${path}.${k}`);
      }
      if (val && typeof val === 'object') {
        queue.push({ value: val, depth: depth + 1, path: `${path}.${k}` });
      }
    }
  }
  return returnValue(null);
}
