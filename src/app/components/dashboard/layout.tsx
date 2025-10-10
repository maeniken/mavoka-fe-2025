"use client";
import { useState } from "react";
import Sidebar from "./sidebar";
import { RoleProvider } from "./RoleContext";
import RequireAuth from "@/app/components/auth/RequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RequireAuth role="admin">
      <RoleProvider role="admin">
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            role="admin"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">{children}</main>
        </div>
      </RoleProvider>
    </RequireAuth>
  );
}
