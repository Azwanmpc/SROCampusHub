"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

export default function ThemeToggle() {
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
      className="flex h-[38px] w-[38px] flex-none items-center justify-center border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] text-[17px] text-[var(--ink)]"
      aria-label="Tukar mod gelap"
    >
      {dark ? <Sun weight="duotone" /> : <Moon weight="duotone" />}
    </button>
  );
}
