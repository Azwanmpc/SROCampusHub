import Link from "next/link";
import { ChartLine, CurrencyCircleDollar, Package, SealCheck, Wrench } from "@phosphor-icons/react";

const MODULES = [
  {
    label: "Pengurusan Tempahan",
    description: "Kelulusan, jadual dan rekod tempahan fasiliti.",
    href: "/login?redirect=/kelulusan",
    icon: SealCheck,
  },
  {
    label: "Pinjaman Aset",
    description: "Pengurusan pinjaman dan pemulangan aset alih.",
    href: "/login?redirect=/pinjaman-aset",
    icon: Package,
  },
  {
    label: "Pengurusan Aduan Kerosakan",
    description: "Status kerja, tugasan dan prestasi penyelenggaraan.",
    href: "/login?redirect=/aduan",
    icon: Wrench,
  },
  {
    label: "Dashboard Hasil",
    description: "Analisis prestasi hasil kemudahan kampus.",
    href: "/login?redirect=/hasil-sewaan",
    icon: CurrencyCircleDollar,
  },
  {
    label: "Dashboard Aset",
    description: "Analitik pinjaman, penyelenggaraan dan pemeriksaan aset.",
    href: "/login?redirect=/aset",
    icon: ChartLine,
  },
];

export default function StaffWorkspace() {
  return (
    <section className="bg-[var(--landing-staff-bg)] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 sm:mb-12">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[#ed1b26]">Warga MPC</div>
          <h2 className="font-archivo text-[26px] font-extrabold text-white sm:text-[32px]">Ruang Warga MPC</h2>
          <p className="mt-2 text-[14px] text-[rgba(255,255,255,0.6)]">
            Sistem operasi dan analitik MPC Wilayah Selatan
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.label}
                href={m.href}
                className="group border border-[rgba(255,255,255,0.12)] bg-[var(--landing-staff-surface)] p-5 transition-colors hover:border-[rgba(237,27,38,0.5)]"
              >
                <Icon weight="duotone" size={24} className="text-[rgba(255,255,255,0.55)] transition-colors group-hover:text-[#ed1b26]" />
                <div className="mt-4 font-archivo text-[14px] font-extrabold text-white">{m.label}</div>
                <div className="mt-1.5 text-[12px] leading-[1.5] text-[rgba(255,255,255,0.5)]">{m.description}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
