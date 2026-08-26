"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

export default function ThemeToggle({ small = false }: { small?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sro-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
      window.dispatchEvent(new Event("sro-theme-change"));
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("sro-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("sro-theme-change"));
  }

  return (
    <button
      onClick={toggleDark}
      className={`flex flex-none items-center justify-center border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] text-[var(--ink)] ${
        small ? "h-[28px] w-[28px] text-[13px]" : "h-[38px] w-[38px] text-[17px]"
      }`}
      aria-label="Tukar mod gelap"
    >
      {dark ? <Sun weight="duotone" /> : <Moon weight="duotone" />}
    </button>
  );
}
