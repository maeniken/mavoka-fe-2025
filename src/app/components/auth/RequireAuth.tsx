"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { isSessionExpired, clearAuth } from "@/lib/auth-storage"; // legacy check (login_at)
import { isExpired } from "@/lib/auth-session"; // konsisten dengan cookie exp
import { useAuth } from "@/app/components/auth/AuthProvider";

type Props = {
  role?: string; // optional role hint (siswa, sekolah, perusahaan, lpk, admin)
  children: React.ReactNode;
};

export default function RequireAuth({ role, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { token, hydrated } = useAuth();
  const [ready, setReady] = useState(false); // memastikan render pertama sama (null) di server & client
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Jangan evaluasi sebelum AuthProvider selesai hydrate, agar tidak redirect prematur saat refresh
    if (!hydrated) return;
    const expiredLegacy = isSessionExpired(); // berdasarkan login_at (lama)
    const expiredCookie = isExpired(); // berdasarkan auth_exp
    const expired = expiredLegacy || expiredCookie; // jika salah satu expired -> treat expired
    const hasToken = Boolean(token);
    if (hasToken && !expired) {
      setAllowed(true);
    } else {
      try { clearAuth(); } catch {}
      // Hindari loop: jika sudah di /login biarkan saja
      if (pathname !== '/login') {
        router.replace('/login' + (expired ? '?reason=expired' : ''));
      }
    }
    setReady(true);
  }, [role, pathname, token, hydrated]);

  // Render pertama (SSR + initial hydration) => null => tidak mismatch
  if (!ready) return null; // tetap skeleton kosong sampai siap
  if (!allowed) return null; // bisa diganti loading spinner
  return <>{children}</>;
}
