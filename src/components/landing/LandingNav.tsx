"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, Moon, Sun, X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { label: "Utama", href: "#top" },
  { label: "Kemudahan", href: "#kemudahan" },
  { label: "Perkhidmatan", href: "#perkhidmatan" },
  { label: "Mengenai SRO", href: "#mengenai-sro" },
  { label: "RKB", href: "https://www.rkbwilayahselatan.com/", external: true },
];

export default function LandingNav({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--landing-border)] bg-[var(--landing-surface)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="#top" className="flex items-center gap-2 font-archivo text-[16px] font-extrabold tracking-[-0.01em] text-[var(--landing-ink)] hover:text-[var(--landing-ink)]">
          <span className="text-[#ed1b26]">MPC</span>
          <span className="hidden text-[rgba(100,116,139,0.5)] sm:inline">|</span>
          <span className="hidden sm:inline">CampusHub</span>
        </Link>

        <nav className="hidden items-center gap-4 text-[13.5px] font-semibold text-[var(--landing-slate)] md:flex lg:gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="transition-colors hover:text-[var(--landing-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onToggleDark}
            aria-label={dark ? "Tukar ke mod cerah" : "Tukar ke mod gelap"}
            className="flex h-9 w-9 items-center justify-center text-[var(--landing-slate)] hover:text-[var(--landing-ink)]"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Link
            href="/login"
            className="whitespace-nowrap bg-[#ed1b26] px-4 py-2.5 font-archivo text-[13px] font-extrabold text-white transition-colors hover:bg-[#c4141e] hover:text-white"
          >
            Log Masuk<span className="hidden lg:inline"> Warga MPC</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center border border-[var(--landing-border)] text-[var(--landing-ink)] md:hidden"
        >
          {menuOpen ? <X size={18} /> : <List size={18} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[var(--landing-border)] py-3 text-[14px] font-semibold text-[var(--landing-ink)] last:border-b-0"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleDark}
              className="flex items-center gap-2 border border-[var(--landing-border)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--landing-ink)]"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />} Mod {dark ? "Cerah" : "Gelap"}
            </button>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex-1 bg-[#ed1b26] px-4 py-2.5 text-center font-archivo text-[13px] font-extrabold text-white"
            >
              Log Masuk Warga MPC
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
