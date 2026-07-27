"use client";

import { useMemo, useState } from "react";
import BookingCard from "./BookingCard";

const FILTERS = [
  { key: "SEMUA", label: "Semua" },
  { key: "MENUNGGU", label: "Menunggu" },
  { key: "DISAHKAN", label: "Disahkan" },
  { key: "DITOLAK", label: "Ditolak" },
];

export default function BookingApprovalList({ bookings }: { bookings: React.ComponentProps<typeof BookingCard>["booking"][] }) {
  const [filter, setFilter] = useState("MENUNGGU");

  const filtered = useMemo(
    () => (filter === "SEMUA" ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  );

  return (
    <div>
      <div className="mb-4 flex w-fit flex-wrap border border-[rgba(32,30,29,0.4)]">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`border-r border-[rgba(32,30,29,0.4)] px-4 py-2 text-[12.5px] font-bold last:border-r-0 ${
              filter === f.key ? "bg-[#6d28d9] text-[#f3f2f2]" : "bg-[#f3f2f2] text-[#201e1d]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.3)]">
        {filtered.length === 0 && <div className="bg-white p-4 text-sm text-[rgba(32,30,29,0.5)]">Tiada tempahan.</div>}
        {filtered.map((b) => (
          <BookingCard key={b.id} booking={b} canApprove />
        ))}
      </div>
    </div>
  );
}
