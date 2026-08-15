"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretDown, Moon, Sun, ArrowUpRight, List, X } from "@phosphor-icons/react";

type LoginOption = { label: string; href: string; note?: string };
type ModuleCard = { badge: string; title: string; description: string; options: LoginOption[] };

const MODULES: ModuleCard[] = [
  {
    badge: "MODUL",
    title: "Tempahan Fasiliti",
    description: "Semak ketersediaan, hantar permohonan, terima kelulusan.",
    options: [
      { label: "Log Masuk Pemohon", href: "/login?redirect=/kalendar" },
      { label: "Log Masuk Admin", href: "/login?redirect=/kelulusan" },
    ],
  },
  {
    badge: "MODUL",
    title: "Pinjaman Aset",
    description: "Permohonan pinjaman aset alih, kelulusan dan pemulangan.",
    options: [
      { label: "Log Masuk Peminjam", href: "/login?redirect=/pinjaman-aset" },
      { label: "Log Masuk Admin", href: "/login?redirect=/pinjaman-aset" },
    ],
  },
  {
    badge: "MODUL",
    title: "Aduan Kerosakan",
    description: "Aduan kerosakan, tugasan staf, jejak status kerja.",
    options: [
      { label: "Log Masuk Pengadu", href: "/aduan-awam", note: "Tiada kata laluan diperlukan" },
      { label: "Log Masuk Staf Penyelenggaraan", href: "/login?redirect=/aduan" },
      { label: "Log Masuk Admin", href: "/login?redirect=/aduan" },
    ],
  },
  {
    badge: "PAPAN PEMUKA",
    title: "Dashboard Hasil",
    description: "Pencapaian hasil wilayah mengikut tempoh dan sumber.",
    options: [{ label: "Log Masuk Staf", href: "/login?redirect=/hasil-sewaan" }],
  },
  {
    badge: "PAPAN PEMUKA",
    title: "Dashboard Aset",
    description: "Daftar aset, lokasi dan status penyelenggaraan berkala.",
    options: [{ label: "Log Masuk Staf", href: "/login?redirect=/aset" }],
  },
  {
    badge: "PAPAN PEMUKA",
    title: "Dashboard RKB",
    description: "Reformasi Kerenah Birokrasi: kes, penambahbaikan, impak.",
    options: [{ label: "Log Masuk Staf", href: "/login?redirect=/rkb" }],
  },
];

const NAV_PLACEHOLDERS = ["Pengenalan SRO", "Carta Organisasi", "Portal Konvensyen RKB"];

function ModuleCardItem({ mod }: { mod: ModuleCard }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      ref={ref}
      className="relative border border-[rgba(32,30,29,0.4)] bg-white p-5"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[rgba(32,30,29,0.5)]">
          {mod.badge}
        </div>
        <div className="mb-1.5 font-archivo text-[17px] font-extrabold">{mod.title}</div>
        <div className="text-[12.5px] leading-[1.5] text-[rgba(32,30,29,0.6)]">{mod.description}</div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 -mt-px border border-[rgba(32,30,29,0.4)] bg-white shadow-[0_8px_20px_rgba(32,30,29,0.15)]">
          {mod.options.map((opt) => (
            <Link
              key={opt.label}
              href={opt.href}
              className="block border-b border-[rgba(32,30,29,0.15)] px-4 py-3 text-[13px] font-bold text-[#201e1d] last:border-b-0 hover:bg-[#f7f6f6]"
            >
              {opt.label}
              {opt.note && <div className="mt-0.5 text-[10.5px] font-normal text-[rgba(32,30,29,0.5)]">{opt.note}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sro-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("sro-theme", next ? "dark" : "light");
  }

  return (
    <div className="min-h-screen bg-white text-[#201e1d]">
      <div className="border-b border-[rgba(32,30,29,0.2)] px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-archivo text-[19px] font-extrabold tracking-[-0.01em]">
            SRO<span className="text-[#e0342a]">CAMPUSHUB</span>
          </div>

          <div className="hidden items-center gap-5 text-[13px] font-semibold text-[rgba(32,30,29,0.75)] md:flex">
            {NAV_PLACEHOLDERS.map((label) => (
              <span key={label} className="cursor-default">
                {label}
              </span>
            ))}
            <span className="flex cursor-default items-center gap-1">
              Recap SRO <CaretDown size={12} />
            </span>
            <span className="flex cursor-default items-center gap-1">
              Facebook SRO <ArrowUpRight size={12} />
            </span>
            <button
              type="button"
              onClick={toggleDark}
              className="flex items-center gap-1.5 text-[rgba(32,30,29,0.75)]"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />} Mod Gelap
            </button>
            <Link
              href="/login"
              className="bg-[#e0342a] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[#c22b22]"
            >
              Login Superadmin
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 items-center justify-center border border-[rgba(32,30,29,0.4)] text-[#201e1d] md:hidden"
          >
            {menuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-4 flex flex-col gap-1 border-t border-[rgba(32,30,29,0.15)] pt-4 text-[13px] font-semibold text-[rgba(32,30,29,0.75)] md:hidden">
            {NAV_PLACEHOLDERS.map((label) => (
              <span key={label} className="cursor-default px-1 py-2">
                {label}
              </span>
            ))}
            <span className="flex cursor-default items-center gap-1 px-1 py-2">
              Recap SRO <CaretDown size={12} />
            </span>
            <span className="flex cursor-default items-center gap-1 px-1 py-2">
              Facebook SRO <ArrowUpRight size={12} />
            </span>
            <button
              type="button"
              onClick={toggleDark}
              className="flex items-center gap-1.5 px-1 py-2 text-left text-[rgba(32,30,29,0.75)]"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />} Mod Gelap
            </button>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-2 bg-[#e0342a] px-4 py-2.5 text-center font-archivo text-[13px] font-extrabold text-white hover:bg-[#c22b22]"
            >
              Login Superadmin
            </Link>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1180px] px-6 py-14">
        <div className="mb-2 font-archivo text-[46px] font-extrabold leading-[1.05] sm:text-[56px]">
          MPC
          <br />
          WILAYAH SELATAN
        </div>
        <p className="max-w-[520px] text-[15px] text-[rgba(32,30,29,0.65)]">
          Tempahan fasiliti, permohonan penyelenggaraan, dan papan pemuka pengurusan — dalam satu sistem.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((mod) => (
            <ModuleCardItem key={mod.title} mod={mod} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(32,30,29,0.2)] px-6 py-5 text-[12px] text-[rgba(32,30,29,0.55)]">
        <span>SROCAMPUSHUB — MPC Wilayah Selatan</span>
        <span>Sistem tempahan fasiliti &amp; penyelenggaraan</span>
      </div>
    </div>
  );
}
