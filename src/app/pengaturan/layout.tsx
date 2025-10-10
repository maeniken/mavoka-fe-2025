"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardLayout2 from "@/app/components/dashboard/DashboardLayout2";

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
  ];

  return (
    <DashboardLayout2 role="siswa">
      <div className="flex flex-col h-full p-6">
        <div className=" shrink-0">
          <div className="flex border-b border-gray-300 w-max">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-2 font-semibold ${
                  pathname === tab.href
                    ? "border-b-2 border-[#0F67B1] text-[#0F67B1] bg-[#0F67B1]/5"
                    : "text-gray-600 hover:text-[#0F67B1]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 mt-5 bg-white h-full">
          {children}
        </div>
      </div>
    </DashboardLayout2>
  );
}