import { NextRequest, NextResponse } from 'next/server';

// Daftar path yang wajib auth. Sesuaikan dengan struktur dashboard Anda.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/dashboard-admin',
  '/dashboard-siswa',
  '/dashboard-sekolah',
  '/dashboard-perusahaan',
  '/dashboard-lpk',
  '/pengaturan',
  '/pengaturan-sekolah',
  '/pengaturan-perusahaan',
  '/pengaturan-lpk',
  '/upload-lowongan',
  '/upload-pelatihan'
];

function isProtectedPath(path: string) {
  return PROTECTED_PREFIXES.some(p => path === p || path.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  // Ambil cookie token
  const token = req.cookies.get('auth_token')?.value;
  const expStr = req.cookies.get('auth_exp')?.value; // optional if stored cookie

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('reason', 'unauthenticated');
    return NextResponse.redirect(url);
  }

  if (expStr) {
    const exp = Number(expStr);
    if (!Number.isNaN(exp) && Date.now() >= exp) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('reason', 'expired');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
