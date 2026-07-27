"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CaretDown, List, Moon, Sun, SignOut } from "@phosphor-icons/react";
import { ROLE_LABEL } from "@/lib/constants";

export default function Navbar({
  name,
  role,
  onMenuClick,
}: {
  name: string;
  role: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-16 flex-none items-center justify-between border-b-2 border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] px-3 text-[#201e1d] sm:px-6">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <button
          onClick={onMenuClick}
          className="flex h-[38px] w-[38px] flex-none items-center justify-center border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] text-[#201e1d] md:hidden"
          aria-label="Buka menu"
        >
          <List weight="bold" size={18} />
        </button>
        <div className="flex h-8 w-8 flex-none items-center justify-center bg-[#6d28d9] font-archivo text-xs font-extrabold text-[#f3f2f2]">
          SRO
        </div>
        <div className="font-archivo text-[17px] font-extrabold leading-none tracking-[-0.01em]">CampusHub</div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleDark}
          className="flex h-[38px] w-[38px] flex-none items-center justify-center border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] text-[17px] text-[#201e1d]"
          aria-label="Tukar mod gelap"
        >
          {dark ? <Sun weight="duotone" /> : <Moon weight="duotone" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex h-[38px] items-center gap-2 border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] py-[5px] pl-[5px] pr-2.5 sm:pr-3"
          >
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#201e1d] text-[10px] font-bold text-[#f3f2f2]">
              {initials}
            </div>
            <span className="hidden max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold sm:inline">
              {name}
            </span>
            <CaretDown weight="duotone" size={13} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-11 z-40 w-[220px] border border-[rgba(32,30,29,0.4)] bg-white">
              <div className="border-b-2 border-[rgba(32,30,29,0.4)] px-3.5 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-[rgba(32,30,29,0.6)]">
                {ROLE_LABEL[role] ?? role}
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-[13.5px] font-bold text-[#6d28d9]"
              >
                <SignOut weight="duotone" />
                Log Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
