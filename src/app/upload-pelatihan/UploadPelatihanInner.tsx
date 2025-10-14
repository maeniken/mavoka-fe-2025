"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import ToggleTabs from "@/app/components/dashboard/toggleTab";
import TableDraftPelatihan from "@/app/components/upload-lowongan-pelatihan/TableDraftPelatihan";
import TablePelatihanTerpasang from "@/app/components/upload-lowongan-pelatihan/TablePelatihanTerpasang";

const tabs = [
  { text: "Draft", value: "draft" },
  { text: "Pelatihan Terpasang", value: "terpasang" },
] as const;

type TabType = (typeof tabs)[number]["value"];

export default function UploadPelatihanInner({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const actor = localStorage.getItem("actor");
    const token =
      localStorage.getItem("access_token_lpk") ||
      localStorage.getItem("access_token");
    console.log("👤 actor:", actor);
    console.log(
      "🔑 token_lpk:",
      token ? token.slice(0, 20) + "..." : null
    );
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFormLikePage =
    pathname?.startsWith("/upload-pelatihan/pelatihan-baru") ||
    pathname?.startsWith("/upload-pelatihan/detail/") ||
    pathname?.startsWith("/upload-pelatihan/edit/");

  const currentTab: TabType = useMemo(() => {
    const q = (searchParams.get("tab") || "draft").toLowerCase();
    return q === "terpasang" ? "terpasang" : "draft";
  }, [searchParams]);

  const handleChange = (next: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/upload-pelatihan?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
    <>
      {isFormLikePage ? (
        <div className="p-6">{children}</div>
      ) : (
        <div className="flex flex-col h-full p-5">
          <h3 className="mb-5">Data Pelatihan Magang</h3>

          <div className="flex items-center justify-between shrink-0">
            <div className="h-10 flex items-center">
              <ToggleTabs<TabType>
                tabs={tabs}
                value={currentTab}
                onChange={handleChange}
              />
            </div>

            <Link
              href="/upload-pelatihan/pelatihan-baru"
              className="h-10 inline-flex items-center px-4 rounded-lg bg-[#0F67B1] text-white font-medium hover:bg-[#0d5692] transition"
            >
              + Buat Pelatihan Baru
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-6 mt-5 bg-white h-full rounded-xl">
            {currentTab === "draft" ? (
              <TableDraftPelatihan />
            ) : (
              <TablePelatihanTerpasang />
            )}
          </div>
        </div>
      )}
    </>
    </Suspense>
  );
}
