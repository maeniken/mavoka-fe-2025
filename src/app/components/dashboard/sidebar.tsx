"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, FileText, LogOut, Menu } from "lucide-react";
import {
  HiOutlineBriefcase,
  HiOutlineDocumentAdd,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { MdOutlineSettings } from "react-icons/md";
import { GrDocumentUpload } from "react-icons/gr";
import { BsBook } from "react-icons/bs";
import { FaChevronUp } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import { AiOutlineFileText, AiOutlineFileDone } from "react-icons/ai";
import { RiContactsBookUploadLine } from "react-icons/ri";
import { BiSolidUserDetail } from "react-icons/bi";
import * as React from "react";
import ConfirmLogoutDialog from "./popupLogout";
import { useMedia } from "./useMedia";
import { useAuth } from '@/app/components/auth/AuthProvider';

type MenuItem = { name: string; href: string; icon: React.ReactNode };

type SidebarProps = {
  role: "admin" | "perusahaan" | "lpk" | "sekolah" | "siswa";
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  role,
  isOpen,
  setIsOpen,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const { logout } = useAuth();

  const isDesktop = useMedia("(min-width:1280px)");
  const isTablet = useMedia("(min-width:744px) and (max-width:1279.98px)");
  const isMobile = useMedia("(max-width:743.98px)");

  React.useEffect(() => {
    if (isDesktop) return;
    if (isTablet) {
      setIsOpen(false);
      setMobileOpen(false);
      return;
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isDesktop, isTablet, isMobile, setIsOpen, setMobileOpen]);

  const menus: Record<typeof role, MenuItem[]> = {
    admin: [
      { name: "Beranda", href: "/dashboard-admin", icon: <Home size={20} /> },
      { name: "Kelola Akun", href: "/kelola-akun", icon: <Users size={20} /> },
      {
        name: "Laporan Umum",
        href: "/laporan-umum",
        icon: <FileText size={20} />,
      },
    ],
    perusahaan: [
      {
        name: "Beranda",
        href: "/dashboard-perusahaan",
        icon: <Home size={20} />,
      },
      {
        name: "Upload Lowongan",
        href: "/upload-lowongan",
        icon: <RiContactsBookUploadLine size={20} />,
      },
      {
        name: "Pelamar",
        href: "/dashboard-perusahaan/pelamar",
        icon: <BiSolidUserDetail size={20} />,
      },
      {
        name: "Monitoring",
        href: "/dashboard-perusahaan/monitoring",
        icon: <HiOutlineClipboardList size={20} />,
      },
      {
        name: "Pengaturan",
        href: "/pengaturan-perusahaan",
        icon: <MdOutlineSettings size={20} />,
      },
    ],
    lpk: [
      { name: "Beranda", href: "/dashboard-lpk", icon: <Home size={20} /> },
      {
        name: "Upload Pelatihan",
        href: "/upload-pelatihan",
        icon: <HiOutlineDocumentAdd size={20} />,
      },
      {
        name: "Penilaian Siswa",
        href: "/penilaian",
        icon: <HiOutlineClipboardList size={20} />,
      },
      {
        name: "Pengaturan",
        href: "/pengaturan-lpk",
        icon: <MdOutlineSettings size={20} />,
      },
    ],
    sekolah: [
      { name: "Beranda", href: "/dashboard-sekolah", icon: <Home size={20} /> },
      {
        name: "Unggah Data Siswa",
        href: "/dashboard-sekolah/unggah-data-siswa",
        icon: <GrDocumentUpload size={20} />,
      },
      {
        name: "Data Siswa",
        href: "/dashboard-sekolah/status-lamaran",
        icon: <AiOutlineFileText size={20} />,
      },
      {
        name: "Laporan Evaluasi",
        href: "/dashboard-sekolah/laporan-evaluasi",
        icon: <AiOutlineFileDone size={20} />,
      },
      {
        name: "Pengaturan",
        href: "/pengaturan-sekolah",
        icon: <MdOutlineSettings size={20} />,
      },
    ],
    // role siswa: tanpa "Laporan & Evaluasi" krn digantikan dropdown
    siswa: [
      { name: "Dashboard", href: "/dashboard-siswa", icon: <Home size={20} /> },
      {
        name: "Pengajuan Magang",
        href: "/dashboard-siswa/pengajuan-magang",
        icon: <HiOutlineBriefcase size={20} />,
      },
      {
        name: "Pengaturan",
        href: "/pengaturan",
        icon: <MdOutlineSettings size={20} />,
      },
    ],
  };

  const handleLogout = () => router.push("/login");

  React.useEffect(() => {
    if (isMobile) setMobileOpen(false);
    if (isTablet) setIsOpen(false);
  }, [pathname, isMobile, isTablet, setIsOpen, setMobileOpen]);

  // ===== Siswa: Dropdown "Pelaksanaan Magang" =====
  const siswaSubmenus: MenuItem[] = [
    {
      name: "Laporan & Evaluasi",
      href: "/dashboard-siswa/laporan-evaluasi",
      icon: <GrDocumentUpload size={18} />,
    },
    {
      name: "Nilai Akhir",
      href: "/dashboard-siswa/nilai-akhir",
      icon: <HiOutlineClipboardList size={18} />,
    },
  ];
  const isSiswaSubActive = (p: string) =>
    siswaSubmenus.some((s) => p.startsWith(s.href));

  const [pelaksanaanOpen, setPelaksanaanOpen] = React.useState<boolean>(
    role === "siswa" ? isSiswaSubActive(pathname) : false
  );

  React.useEffect(() => {
    if (role !== "siswa") return;
    setPelaksanaanOpen(isSiswaSubActive(pathname));
  }, [pathname, role]);

  // Saat dropdown dibuka & belum memilih sub-menu, nonaktifkan highlight menu lain
  const suppressOthers =
    role === "siswa" && pelaksanaanOpen && !isSiswaSubActive(pathname);

  const LeftActiveBar = () => (
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0F67B1] rounded-r-md" />
  );

  const labelVisible =
    (isDesktop && isOpen) || (isTablet && isOpen) || (isMobile && mobileOpen);

  // ====== Utility (CLOSED: biru full, ikon center, kanan rapat) ======
  const compact = !labelVisible;
  const rowPad = compact ? "px-0" : "px-3";
  const rowMarginLeft = compact ? "ml-2" : "ml-2";
  const rowJustify = compact ? "justify-center" : "justify-start";
  const gapClass = compact ? "gap-0" : "gap-2";
  const itemPad = `${rowPad} ${rowMarginLeft}`;

  const rowBgFull = (active: boolean) =>
    active ? "bg-[#0F67B1] text-white" : "text-gray-700 hover:bg-gray-100";

  const renderMenuList = () => (
    <nav className="mt-6 flex-1 flex flex-col space-y-3">
      {menus[role].map((item) => {
        // Siswa: item "Pengajuan Magang"
        if (
          role === "siswa" &&
          item.href === "/dashboard-siswa/pengajuan-magang"
        ) {
          const isActive = pathname === item.href && !suppressOthers;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) setMobileOpen(false);
                if (isTablet) setIsOpen(false);
              }}
            >
              <div className="relative flex items-center">
                {isActive && <LeftActiveBar />}
                <div
                  className={`flex ${rowJustify} items-center ${gapClass} ${itemPad} py-2 transition rounded-l-md w-full ${rowBgFull(
                    isActive
                  )}`}
                >
                  {item.icon}
                  {labelVisible ? (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.name}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        }

        // Siswa: dropdown Pelaksanaan Magang sebelum "Pengaturan"
        if (role === "siswa" && item.href === "/pengaturan") {
          const pengaturanActive =
            pathname.startsWith("/pengaturan") && !suppressOthers;

          return (
            <React.Fragment key="dropdown-siswa-pelaksanaan">
              <button
                type="button"
                onClick={() => setPelaksanaanOpen((v) => !v)}
                className="w-full text-left shadow-none px-0 py-0"
              >
                <div className="relative flex items-center">
                  {(pelaksanaanOpen || isSiswaSubActive(pathname)) && (
                    <LeftActiveBar />
                  )}
                  <div
                    className={`flex ${rowJustify} items-center ${gapClass} ${itemPad} py-2 transition rounded-l-md w-full ${rowBgFull(
                      pelaksanaanOpen || isSiswaSubActive(pathname)
                    )}`}
                  >
                    <BsBook size={20} />
                    {labelVisible ? (
                      <>
                        <span className="text-sm font-medium whitespace-nowrap">
                          Pelaksanaan Magang
                        </span>
                        <span className="ml-auto pr-1">
                          {pelaksanaanOpen ? (
                            <FaChevronUp size={12} />
                          ) : (
                            <FaChevronDown size={12} />
                          )}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </button>

              {pelaksanaanOpen && (
                <div
                  className={`${labelVisible ? "ml-6" : "ml-2"} mt-2 space-y-2`}
                >
                  {siswaSubmenus.map((sub) => {
                    const active = pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => {
                          if (isMobile) setMobileOpen(false);
                          if (isTablet) setIsOpen(false);
                        }}
                      >
                        <div
                          className={`flex items-center gap-2 px-3 py-2 transition
    ${active ? "bg-[#0F67B1]/70 text-white" : "text-gray-700 hover:bg-gray-100"}
    rounded-l-md rounded-r-none
  `}
                        >
                          {sub.icon}
                          {labelVisible ? (
                            <span className="text-sm font-medium">
                              {sub.name}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pengaturan setelah dropdown */}
              <Link
                href={item.href}
                onClick={() => {
                  if (isMobile) setMobileOpen(false);
                  if (isTablet) setIsOpen(false);
                }}
              >
                <div className="relative flex items-center">
                  {pengaturanActive && <LeftActiveBar />}
                  <div
                    className={`flex ${rowJustify} items-center ${gapClass} ${itemPad} py-2 transition rounded-l-md w-full ${rowBgFull(
                      pengaturanActive
                    )}`}
                  >
                    {item.icon}
                    {labelVisible ? (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {item.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </React.Fragment>
          );
        }

        const normalized =
          pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;

        // Khusus Monitoring (perusahaan) → aktif utk semua sub-route
        const isMonitoringItem =
          role === "perusahaan" &&
          item.href === "/dashboard-perusahaan/monitoring";

        const isActiveBase = isMonitoringItem
          ? normalized === "/dashboard-perusahaan/monitoring" ||
            normalized.startsWith("/dashboard-perusahaan/monitoring/")
          : item.href === "/pengaturan-sekolah"
          ? normalized.startsWith("/pengaturan-sekolah")
          : item.href === "/pengaturan"
          ? normalized.startsWith("/pengaturan")
          : item.href === "/laporan-umum"
          ? normalized.startsWith("/laporan-umum")
          : item.href === "/pengaturan-perusahaan"
          ? normalized.startsWith("/pengaturan-perusahaan")
          : item.href === "/upload-lowongan"
          ? normalized.startsWith("/upload-lowongan")
          : item.href === "/upload-pelatihan"
          ? normalized.startsWith("/upload-pelatihan")
          : normalized === item.href;

        const isActive = isActiveBase && !suppressOthers;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (isMobile) setMobileOpen(false);
              if (isTablet) setIsOpen(false);
            }}
          >
            <div className="relative flex items-center">
              {isActive && <LeftActiveBar />}
              <div
                className={`flex ${rowJustify} items-center ${gapClass} ${itemPad} py-2 transition rounded-l-md w-full ${rowBgFull(
                  isActive
                )}`}
              >
                {item.icon}
                {labelVisible ? (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => setLogoutOpen(true)}
        className={`shadow-none relative flex ${rowJustify} items-center ${gapClass} ${itemPad} py-2 rounded-l-md text-[#BA0000] hover:bg-[#F3F4F6] transition`}
      >
        <LogOut size={20} />
        {labelVisible ? (
          <span className="text-sm font-medium whitespace-nowrap">Keluar</span>
        ) : null}
      </button>
    </nav>
  );

  const Header = ({ onToggle }: { onToggle: () => void }) => (
    <div
      className={`flex items-center border-b h-[84px] transition-all duration-300
      ${labelVisible ? "px-4 gap-3 justify-start" : "px-0 justify-center"}`}
    >
      <button
        onClick={onToggle}
        className="hover:bg-transparent rounded-none shadow-none p-0"
        aria-label="Toggle sidebar"
      >
        <Menu size={22} />
      </button>

      {labelVisible ? (
        <Link
          href="/"
          aria-label="Ke landing page"
          onClick={() => {
            if (isMobile) setMobileOpen(false);
            if (isTablet) setIsOpen(false);
          }}
          className="mt-[-7px]"
        >
          <Image
            src="/img/logo-mavoka.png"
            alt="Mavoka"
            width={140}
            height={40}
            className="transition-all duration-300 cursor-pointer"
            priority
          />
        </Link>
      ) : null}
    </div>
  );

  return (
    <>
      <aside
        className={[
          "bg-white border-r flex flex-col min-h-screen transition-all duration-300 overflow-hidden",
          isDesktop ? (isOpen ? "w-60" : "w-16") : "",
          isTablet ? (isOpen ? "w-60" : "w-16") : "",
          isMobile ? "hidden" : "",
        ].join(" ")}
      >
        <Header onToggle={() => setIsOpen((v) => !v)} />
        {renderMenuList()}
      </aside>

      {isMobile && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${
              mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className={`fixed z-50 top-0 left-0 h-full bg-white border-r w-60 transform transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-center border-b py-3 px-4">
              <Link
                href="/"
                aria-label="Ke landing page"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/img/logo-mavoka.png"
                  alt="Mavoka"
                  width={120}
                  height={40}
                  priority
                  className="cursor-pointer"
                />
              </Link>
            </div>
            {renderMenuList()}
          </aside>
        </>
      )}

      {logoutOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"></div>
      )}

      <ConfirmLogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          logout('manual');
          setLogoutOpen(false);
          router.push('/login');
        }}
      />
    </>
  );
}
