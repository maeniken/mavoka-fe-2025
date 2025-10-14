"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";
import { Suspense } from "react";

export default function PengaturanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { href: "/pengaturan", label: "Data Diri" },
    { href: "/pengaturan/akun", label: "Akun" },
    { href: "/pengaturan/sekolah", label: "Sekolah" },
  ] as const;

  // refs untuk ukur posisi/width tombol aktif (indikator biru)
  const wrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useMemo(
    () => tabs.map(() => React.createRef<HTMLAnchorElement>()),
    [tabs]
  );

  // deteksi tab aktif dari pathname
  const activeIdx = useMemo(() => {
    const exact = tabs.findIndex((t) => t.href === pathname);
    if (exact !== -1) return exact;
    if (pathname.startsWith("/pengaturan/akun"))
      return tabs.findIndex((t) => t.href === "/pengaturan/akun");
    if (pathname.startsWith("/pengaturan/sekolah"))
      return tabs.findIndex((t) => t.href === "/pengaturan/sekolah");
    return tabs.findIndex((t) => t.href === "/pengaturan"); // default Data Diri
  }, [pathname, tabs]);

  // posisi indikator biru
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const updateIndicator = () => {
    const btn = linkRefs[activeIdx]?.current;
    const wrap = wrapRef.current;
    if (!btn || !wrap) return;
    const b = btn.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    setIndicator({ left: b.left - w.left, width: b.width });
  };

  // ukur segera pada first render & setiap ganti tab (lebih awal dari paint)
  useLayoutEffect(() => {
    updateIndicator();
    const raf = requestAnimationFrame(updateIndicator); 
    return () => cancelAnimationFrame(raf);
  }, [activeIdx]);

  // observe resize + fallback timer di very-first-mount
  useEffect(() => {
    const ro = new ResizeObserver(updateIndicator);
    if (wrapRef.current) ro.observe(wrapRef.current);
    linkRefs.forEach((r) => r.current && ro.observe(r.current!));

    const t = setTimeout(updateIndicator, 60);

    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [linkRefs, tabs.length]);

  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
    <DashboardLayout2 role="siswa">
      <div className="flex flex-col h-full p-6">
        {/* Tabs */}
        <div className="shrink-0">
          <div
            ref={wrapRef}
            className="relative inline-flex gap-3 pb-3"
            role="tablist"
          >
            {/* garis dasar abu */}
            <div className="pointer-events-none absolute -bottom-0 left-0 right-0 h-[2px] bg-gray-200" />
            {tabs.map((tab, i) => {
              const isActive = i === activeIdx;
              return (
                <Link
                  key={tab.href}
                  ref={linkRefs[i]}
                  href={tab.href}
                  role="tab"
                  aria-selected={isActive}
                  className={[
                    "px-4 py-2 rounded-[5px] text-sm transition-colors shadow-none",
                    isActive
                      ? "bg-[rgba(15,103,177,0.05)] text-[#0F67B1] font-medium"
                      : "bg-[#F1F2F3] text-[#646161] hover:text-gray-700 font-medium",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
            {/* indikator biru di bawah tab aktif */}
            <div
              className="pointer-events-none absolute -bottom-[1px] h-[3px] bg-[#0F67B1] rounded-full transition-all duration-200"
              style={{ left: indicator.left, width: indicator.width }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 mt-5 bg-white h-full">
          {children}
        </div>
      </div>
    </DashboardLayout2>
    </Suspense>
  );
}
