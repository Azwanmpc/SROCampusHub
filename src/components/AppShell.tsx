"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppShell({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar name={name} role={role} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar name={name} role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-white p-4 text-[#201e1d] sm:p-7">{children}</main>
      </div>
    </div>
  );
}
