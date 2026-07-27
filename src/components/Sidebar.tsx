"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_LABEL } from "@/lib/constants";

type NavItem = { href: string; label: string; roles: string[] };

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["SUPERADMIN", "ADMIN", "PEMOHON", "PENGADU", "TEKNIKAL"] },
  { href: "/kalendar", label: "Kalendar Tempahan", roles: ["SUPERADMIN", "ADMIN", "PEMOHON"] },
  { href: "/tempahan-saya", label: "Tempahan Saya", roles: ["PEMOHON"] },
  { href: "/kelulusan", label: "Kelulusan Tempahan", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/fasiliti", label: "Maklumat Fasiliti", roles: ["SUPERADMIN", "ADMIN", "PEMOHON", "PENGADU", "TEKNIKAL"] },
  { href: "/aduan", label: "Aduan Kerosakan", roles: ["SUPERADMIN", "ADMIN", "PENGADU", "TEKNIKAL"] },
  { href: "/prestasi", label: "Prestasi Penyelenggaraan", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/laporan", label: "Laporan & Analitik", roles: ["SUPERADMIN", "ADMIN"] },
  { href: "/tetapan", label: "Tetapan & Pengguna", roles: ["SUPERADMIN"] },
];

export default function Sidebar({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-700 text-xs font-extrabold text-white">
          SRO
        </div>
        <div className="text-xs font-bold leading-tight text-slate-800">
          CampusHub
          <div className="text-[10px] font-normal text-slate-400">PPM Wilayah Selatan</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-4">
        <div className="mb-3 text-xs">
          <div className="font-semibold text-slate-800">{name}</div>
          <div className="text-slate-400">{ROLE_LABEL[role] ?? role}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-md border border-slate-300 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Log Keluar
        </button>
      </div>
    </aside>
  );
}
