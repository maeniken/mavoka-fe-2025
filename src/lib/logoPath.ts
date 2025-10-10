export interface LogoCandidatesResult {
  primary: string | null;
  candidates: string[];
  raw: string;
  reason?: string;
}

function getBaseOrigin(): string {
  const env = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000').trim();
  try {
    // URL() agar mudah ambil origin (buang path /api dsb)
    const u = new URL(env);
    return u.origin; // hanya origin
  } catch {
    // fallback naive removal
    return env.replace(/\/api\/?$/i, '').replace(/\/$/, '');
  }
}

export function buildLogoCandidates(input: any): LogoCandidatesResult {
  const rawSource = (input?.logoUrl || input?.logo_perusahaan_url || input?.logo_perusahaan || input?.logo || input || '').toString();
  const rawTrimmed = rawSource.trim();
  
  // Debug logging untuk development
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[buildLogoCandidates] Input:', { input, rawSource, rawTrimmed });
  }
  
  if (!rawTrimmed || rawTrimmed === '[object Object]') {
    return { primary: null, candidates: [], raw: rawSource, reason: 'empty_or_object' };
  }
  let val = rawTrimmed.split(/\s+/)[0];
  if (val.includes('\\')) val = val.replace(/\\+/g, '/');

  // Absolute Windows path containing storage/... -> extract after storage/
  const storageAbs = val.match(/storage\/(.+)$/i);
  if (storageAbs && !/^https?:\/\//i.test(val)) {
    val = storageAbs[1];
  }

  const origin = getBaseOrigin();
  const cands: string[] = [];

  // Debug origin
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[buildLogoCandidates] Origin:', origin, 'Processing val:', val);
  }

  // 1. Absolute URL as-is
  if (/^https?:\/\//i.test(val)) {
    cands.push(val);
    // Try to derive cross-fallbacks from absolute URL path
    try {
      const u = new URL(val);
      const path = u.pathname.replace(/^\/+/, '');
      // If it points to storage/perusahaan/logo/..., add legacy logos/perusahaan fallback
      if (/^storage\/(perusahaan|sekolah|lpk)\/logo\//i.test(path)) {
        const filename = path.replace(/^storage\/(?:perusahaan|sekolah|lpk)\/logo\//i, '');
        cands.push(u.origin + '/logos/perusahaan/' + filename);
      }
      // If it points to legacy logos/perusahaan/..., add storage variant fallback
      if (/^logos\/perusahaan\//i.test(path)) {
        const filename = path.replace(/^logos\/perusahaan\//i, '');
        cands.push(u.origin + '/storage/perusahaan/logo/' + filename);
      }
    } catch {
      // ignore URL parsing errors
    }
  } else {
    // 2. /storage/ or storage/
    if (/^\/storage\//i.test(val)) cands.push(origin + val);
    if (/^storage\//i.test(val)) cands.push(origin + '/' + val);

    // 3. relative canonical: perusahaan|sekolah|lpk
    if (/^(perusahaan|sekolah|lpk)\//i.test(val)) {
      const rel = val.replace(/^\/+/, '');
      cands.push(origin + '/storage/' + rel);
      cands.push(origin + '/' + rel); // fallback
      
      // Handle legacy path format conversion
      // Convert "perusahaan/logo/filename" to "logos/perusahaan/filename"
      if (/^perusahaan\/logo\//i.test(rel)) {
        const filename = rel.replace(/^perusahaan\/logo\//i, '');
        cands.push(origin + '/logos/perusahaan/' + filename);
      }
    }

    // 4. legacy logos folder
    if (/^\/logos\//i.test(val)) cands.push(origin + val);
    if (/^logos\//i.test(val)) {
      cands.push(origin + '/' + val);
      // Handle conversion from legacy logos format to storage format
      // Convert "logos/perusahaan/filename" to "storage/perusahaan/logo/filename"
      if (/^logos\/perusahaan\//i.test(val)) {
        const filename = val.replace(/^logos\/perusahaan\//i, '');
        cands.push(origin + '/storage/perusahaan/logo/' + filename);
        // Also try without storage prefix as a permissive fallback
        cands.push(origin + '/perusahaan/logo/' + filename);
      }
    }

    // 5. fallback treat as public asset
    if (!cands.length) cands.push(origin + (val.startsWith('/') ? val : '/' + val));
  }

  const unique = Array.from(new Set(cands));
  
  // Debug final candidates
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[buildLogoCandidates] Final candidates:', unique);
  }
  
  return { primary: unique[0] || null, candidates: unique, raw: rawSource };
}
