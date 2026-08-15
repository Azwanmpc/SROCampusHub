"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  CalendarBlank,
  Buildings,
  SealCheck,
  WarningCircle,
  ChartBar,
  ChartLine,
  CurrencyCircleDollar,
  Wrench,
  Gear,
  SignOut,
  X,
} from "@phosphor-icons/react";
import { ROLE_LABEL } from "@/lib/constants";

type NavItem = { href: string; label: string; roles: string[]; icon: React.ElementType };

type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Utama",
    items: [{ href: "/dashboard", label: "Dashboard", roles: ["SUPERADMIN", "ADMIN", "PEMOHON", "TEKNIKAL"], icon: House }],
  },
  {
    label: "Tempahan",
    items: [
      { href: "/kalendar", label: "Kalendar Tempahan", roles: ["SUPERADMIN", "ADMIN", "PEMOHON"], icon: CalendarBlank },
      { href: "/tempahan-saya", label: "Tempahan Saya", roles: ["PEMOHON"], icon: Buildings },
      { href: "/kelulusan", label: "Kelulusan Tempahan", roles: ["SUPERADMIN", "ADMIN"], icon: SealCheck },
    ],
  },
  {
    label: "Fasiliti",
    items: [{ href: "/fasiliti", label: "Maklumat Fasiliti", roles: ["SUPERADMIN", "ADMIN", "PEMOHON", "PENGADU", "TEKNIKAL"], icon: Buildings }],
  },
  {
    label: "Penyelenggaraan",
    items: [
      { href: "/aduan", label: "Aduan Kerosakan", roles: ["SUPERADMIN", "ADMIN", "PENGADU", "TEKNIKAL"], icon: WarningCircle },
      { href: "/prestasi", label: "Prestasi Penyelenggaraan", roles: ["SUPERADMIN", "ADMIN"], icon: ChartBar },
    ],
  },
  {
    label: "Pentadbiran",
    items: [
      { href: "/laporan", label: "Laporan & Analitik", roles: ["SUPERADMIN", "ADMIN"], icon: ChartLine },
      { href: "/hasil-sewaan", label: "Dashboard Hasil", roles: ["SUPERADMIN", "ADMIN"], icon: CurrencyCircleDollar },
      { href: "/aset", label: "Dashboard Aset", roles: ["SUPERADMIN", "ADMIN"], icon: Wrench },
      { href: "/rkb", label: "Dashboard RKB", roles: ["SUPERADMIN", "ADMIN"], icon: ChartBar },
      { href: "/tetapan", label: "Tetapan & Pengguna", roles: ["SUPERADMIN"], icon: Gear },
    ],
  },
];

export default function Sidebar({
  name,
  role,
  open,
  onClose,
}: {
  name: string;
  role: string;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(32,30,29,0.5)] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[246px] shrink-0 flex-col overflow-y-auto border-r-2 border-[rgba(32,30,29,0.4)] bg-white py-[18px] text-[#201e1d] transition-transform duration-200 md:relative md:z-0 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-2 flex items-center justify-between px-[18px] md:hidden">
          <div className="font-archivo text-sm font-extrabold">Menu</div>
          <button onClick={onClose} aria-label="Tutup menu" className="text-[#201e1d]">
            <X weight="bold" size={18} />
          </button>
        </div>
        <div className="flex-1">
          {NAV_GROUPS.map((grp) => {
            const items = grp.items.filter((it) => it.roles.includes(role));
            if (items.length === 0) return null;
            return (
              <div key={grp.label} className="mb-5">
                <div className="mb-1.5 px-[18px] text-[10px] font-bold uppercase tracking-[0.08em] text-[rgba(32,30,29,0.55)]">
                  {grp.label}
                </div>
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-[18px] py-2.5 text-[13.5px] font-bold ${
                        active ? "bg-[#f3f2f2] text-[#6d28d9]" : "text-[#201e1d] hover:bg-[#f7f6f6]"
                      }`}
                    >
                      <Icon weight="duotone" size={18} className="flex-none" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex-none border-t-2 border-[rgba(32,30,29,0.15)] px-[18px] pt-3">
          <div className="mb-2 text-xs">
            <div className="font-bold text-[#201e1d]">{name}</div>
            <div className="text-[rgba(32,30,29,0.55)]">{ROLE_LABEL[role] ?? role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 py-3 text-[13.5px] font-bold text-[#6d28d9]"
          >
            <SignOut weight="duotone" size={18} />
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
