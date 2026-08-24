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
  category: string | null;
  staffNote: string | null;
  estimatedCost: number;
  createdAt: string;
  user: { name: string } | null;
  guestName: string | null;
};

const FILTERS = [
  { key: "SEMUA", label: "Semua" },
  { key: "BARU", label: "Baru" },
  { key: "DALAM_TINDAKAN", label: "Belum Selesai" },
  { key: "MENUNGGU_PENGESAHAN", label: "Menunggu Pengesahan" },
  { key: "SELESAI", label: "Selesai" },
];

const STATUS_ORDER: Record<string, number> = {
  BARU: 0,
  DALAM_TINDAKAN: 1,
  MENUNGGU_PENGESAHAN: 2,
  SELESAI: 3,
};

const SORT_OPTIONS = [
  { key: "TARIKH", label: "Semua" },
  { key: "BARU", label: "Baru" },
  { key: "DALAM_TINDAKAN", label: "Belum Selesai" },
  { key: "SELESAI", label: "Selesai" },
  { key: "JENIS_DALAMAN", label: "Tindakan Dalaman" },
  { key: "JENIS_KONTRAKTOR", label: "Kontraktor Luar" },
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
  const [sort, setSort] = useState("TARIKH");
  const canApprove = role === "SUPERADMIN" || role === "ADMIN";

  const filtered = useMemo(() => {
    const base = filter === "SEMUA" ? complaints : complaints.filter((c) => c.status === filter);
    if (!canApprove || filter !== "SEMUA" || sort === "TARIKH") return base;
    if (sort === "JENIS_DALAMAN" || sort === "JENIS_KONTRAKTOR") {
      const wanted = sort === "JENIS_DALAMAN" ? "DALAMAN" : "KONTRAKTOR";
      return [...base].sort(
        (a, b) => (a.repairType === wanted ? 0 : 1) - (b.repairType === wanted ? 0 : 1) || STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      );
    }
    return [...base].sort(
      (a, b) => (a.status === sort ? 0 : 1) - (b.status === sort ? 0 : 1) || STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    );
  }, [complaints, filter, sort, canApprove]);

  async function handleDelete(id: string) {
    if (!confirm("Padam aduan ini?")) return;
    await fetch(`/api/complaints/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex w-full overflow-x-auto border border-[rgba(var(--ink-rgb),0.4)] sm:w-fit">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-none whitespace-nowrap border-r border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 text-[12.5px] font-bold last:border-r-0 ${
                  filter === f.key ? "bg-[var(--accent)] text-[#f3f2f2]" : "bg-[var(--surface)] text-[var(--ink)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {canApprove && filter === "SEMUA" && (
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[rgba(var(--ink-rgb),0.7)]">
              Susun ikut status:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-2.5 py-2 text-[12.5px]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <div className="flex flex-col gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.3)]">
        {filtered.length === 0 && (
          <div className="bg-[var(--white)] p-4 text-sm text-[rgba(var(--ink-rgb),0.5)]">Tiada aduan.</div>
        )}
        {filtered.map((c) => (
          <ComplaintCard key={c.id} complaint={c} role={role} onDelete={role === "PENGADU" ? handleDelete : undefined} />
        ))}
      </div>
    </div>
  );
}
