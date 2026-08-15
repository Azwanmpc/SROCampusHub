"use client";

import { useEffect, useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import PublicServices from "@/components/landing/PublicServices";
import FacilityShowcase from "@/components/landing/FacilityShowcase";
import CampusStats from "@/components/landing/CampusStats";
import StaffWorkspace from "@/components/landing/StaffWorkspace";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-ink)]">
      <LandingNav dark={dark} onToggleDark={toggleDark} />
      <Hero />
      <PublicServices />
      <FacilityShowcase />
      <CampusStats />
      <StaffWorkspace />
      <LandingFooter />
    </div>
  );
}
