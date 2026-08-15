import { ArrowUpRight, Megaphone } from "@phosphor-icons/react";

export default function AnnouncementBar() {
  return (
    <a
      href="https://www.rkbwilayahselatan.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[var(--landing-staff-bg)] px-5 py-2.5 text-white transition-colors hover:bg-[var(--landing-staff-surface)] sm:px-8"
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-[12.5px] sm:justify-between sm:text-[13px]">
        <span className="flex items-center gap-2">
          <Megaphone weight="fill" size={15} className="flex-none text-[#ed1b26]" />
          <span>
            <span className="font-bold">Konvensyen RKB Wilayah Selatan</span>
            <span className="text-[rgba(255,255,255,0.65)]"> — program akan datang</span>
          </span>
        </span>
        <span className="flex items-center gap-1 font-bold text-white/90">
          Ketahui Lebih Lanjut <ArrowUpRight size={13} />
        </span>
      </div>
    </a>
  );
}
