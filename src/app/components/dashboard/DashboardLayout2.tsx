"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import TopNavbar from "./topNavbar";
import Sidebar from "./sidebar";
import RequireAuth from "@/app/components/auth/RequireAuth";

type Role = "siswa" | "sekolah" | "lpk" | "perusahaan";

function deriveRoleFromPath(path: string): Role | undefined {
  if (path.includes("/dashboard-siswa")) return "siswa";
  if (path.includes("/dashboard-sekolah")) return "sekolah";
  if (path.includes("/dashboard-lpk")) return "lpk";
  if (path.includes("/dashboard-perusahaan")) return "perusahaan";
  return undefined;
}

function buildSettingsHref(role: Role) {
  switch (role) {
    case "siswa":
      return "/pengaturan";
    case "sekolah":
      return "/pengaturan-sekolah";
    case "lpk":
      return "/pengaturan-lpk";
    case "perusahaan":
      return "/pengaturan-perusahaan";
    default:
      return "/pengaturan";
  }
}

export default function DashboardLayout2({
  children,
  role: roleProp,
}: {
  children: React.ReactNode;
  role?: Role;
}) {
  const pathname = usePathname();
  const role = (roleProp ?? deriveRoleFromPath(pathname) ?? "siswa") as Role;

  const variant = role === "siswa" ? "siswa" : "welcome";
  const settingsHref = buildSettingsHref(role);

  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RequireAuth role={role}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          role={role}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNavbar
            variant={variant}
            settingsHref={settingsHref}
            hasNotification
            onMobileOpen={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-2 bg-gray-50">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
