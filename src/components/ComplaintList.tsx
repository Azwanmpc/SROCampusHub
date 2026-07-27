"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ComplaintCard from "./ComplaintCard";

type Complaint = {
  id: string;
  location: string;
  description: string;
  photoUrl: string | null;
  status: string;
  priority: string;
  repairType: string | null;
  staffNote: string | null;
  estimatedCost: number;
  createdAt: string;
  user: { name: string };
};

const FILTERS = [
  { key: "SEMUA", label: "Semua" },
  { key: "BARU", label: "Baru" },
  { key: "DALAM_TINDAKAN", label: "Belum Selesai" },
  { key: "MENUNGGU_PENGESAHAN", label: "Menunggu Pengesahan" },
  { key: "SELESAI", label: "Selesai" },
];

export default function ComplaintList({
  complaints,
  role,
  showFilters,
}: {
  complaints: Complaint[];
  role: string;
  showFilters: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("SEMUA");

  const filtered = useMemo(
    () => (filter === "SEMUA" ? complaints : complaints.filter((c) => c.status === filter)),
    [complaints, filter]
  );

  async function handleDelete(id: string) {
    if (!confirm("Padam aduan ini?")) return;
    await fetch(`/api/complaints/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {showFilters && (
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
      )}

      <div className="flex flex-col gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.3)]">
        {filtered.length === 0 && (
          <div className="bg-white p-4 text-sm text-[rgba(32,30,29,0.5)]">Tiada aduan.</div>
        )}
        {filtered.map((c) => (
          <ComplaintCard key={c.id} complaint={c} role={role} onDelete={role === "PENGADU" ? handleDelete : undefined} />
        ))}
      </div>
    </div>
  );
}
