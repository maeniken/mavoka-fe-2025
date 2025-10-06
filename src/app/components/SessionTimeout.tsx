"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuth, isSessionExpired } from "@/lib/auth-storage";

type Props = {
  timeoutMs?: number;
};

export default function SessionTimeout({ timeoutMs = 1000 * 60 * 60 }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const isProtectedPath = React.useCallback((p: string | null) => {
    if (!p) return false;
    // patterns that are considered protected (dashboard, pengaturan, admin tools, upload pages, kelola)
    const protectedPatterns = [
      "/dashboard",
      "/pengaturan",
      "/kelola",
      "/upload-",
      "/laporan-",
      "/dashboard-",
    ];
    return protectedPatterns.some((pat) => p.startsWith(pat) || p.includes(pat));
  }, []);

  const doLogout = React.useCallback(() => {
    clearAuth();
    // Only redirect to login if the user is currently on a protected page.
    // This prevents redirecting users away from the root/public page on first load.
    try {
      const p = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
      if (isProtectedPath(p)) {
        router.replace("/login");
      }
    } catch {
      // best-effort: if anything goes wrong, avoid throwing; do not navigate.
    }
  }, [isProtectedPath, pathname, router]);

  React.useEffect(() => {
    if (isSessionExpired(timeoutMs)) {
      doLogout();
      return;
    }

    // remaining time until expiry
    const raw = localStorage.getItem("login_at");
    const at = raw ? Number(raw) : Date.now();
    const remaining = Math.max(0, timeoutMs - (Date.now() - at));

    const t = setTimeout(() => {
      doLogout();
    }, remaining + 1000); // slight buffer

    // listen to visibility change: if user returns and session expired, logout
    const onVis = () => {
      if (isSessionExpired(timeoutMs)) doLogout();
    };
    document.addEventListener("visibilitychange", onVis);

    // listen to storage events to sync logout across tabs
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "login_at") {
        // if removed or new value indicates expired, logout (and redirect only if needed)
        if (!e.newValue || isSessionExpired(timeoutMs)) doLogout();
      }
      if (e.key === "token") {
        if (!e.newValue) doLogout();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, [doLogout, timeoutMs]);

  return null;
}
