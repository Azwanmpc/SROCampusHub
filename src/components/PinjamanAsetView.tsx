"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import PinjamanAsetForm from "@/components/PinjamanAsetForm";
import PinjamanAsetCard, { type PinjamanAset } from "@/components/PinjamanAsetCard";
import PinjamanAsetPrintModal from "@/components/PinjamanAsetPrintModal";

const STAFF_FILTERS = [
  { key: "SEMUA", label: "Semua" },
  { key: "MENUNGGU_KELULUSAN", label: "Menunggu Kelulusan" },
  { key: "DILULUSKAN", label: "Dipinjam" },
  { key: "DIPULANGKAN", label: "Menunggu Pengesahan" },
  { key: "SELESAI", label: "Selesai" },
];

export default function PinjamanAsetView({ userId, role }: { userId: string; role: string }) {
  const [records, setRecords] = useState<PinjamanAset[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("SEMUA");
  const [printRecord, setPrintRecord] = useState<PinjamanAset | null>(null);

  const isStaff = role === "SUPERADMIN" || role === "ADMIN";

  function load() {
    fetch("/api/pinjaman-aset")
      .then((r) => r.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    if (!isStaff || filter === "SEMUA") return records;
    return records.filter((r) => r.status === filter);
  }, [records, isStaff, filter]);

  if (isStaff) {
    return (
      <div>
        <div className="mb-4 flex w-full overflow-x-auto border border-[rgba(var(--ink-rgb),0.4)] sm:w-fit">
          {STAFF_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-none whitespace-nowrap border-r border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 text-[12.5px] font-bold last:border-r-0 ${
                filter === f.key ? "bg-[#6d28d9] text-[#f3f2f2]" : "bg-[var(--surface)] text-[var(--ink)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.3)]">
          {!records && <div className="bg-[var(--white)] p-4 text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan...</div>}
          {records && filtered.length === 0 && <div className="bg-[var(--white)] p-4 text-sm text-[rgba(var(--ink-rgb),0.5)]">Tiada permohonan.</div>}
          {filtered.map((r) => (
            <PinjamanAsetCard key={r.id} record={r} isStaff isOwner={r.pemohon.id === userId} onChanged={load} onPrint={setPrintRecord} />
          ))}
        </div>

        {printRecord && <PinjamanAsetPrintModal record={printRecord} onClose={() => setPrintRecord(null)} />}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-[#6d28d9] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95]"
        >
          <Plus weight="bold" /> {showForm ? "Tutup Borang" : "Borang Pinjaman Baharu"}
        </button>
      </div>

      {showForm && (
        <div className="mb-5">
          <PinjamanAsetForm onDone={load} />
        </div>
      )}

      <div className="flex flex-col gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.3)]">
        {!records && <div className="bg-[var(--white)] p-4 text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan...</div>}
        {records && records.length === 0 && <div className="bg-[var(--white)] p-4 text-sm text-[rgba(var(--ink-rgb),0.5)]">Tiada permohonan pinjaman lagi.</div>}
        {records?.map((r) => (
          <PinjamanAsetCard key={r.id} record={r} isStaff={false} isOwner onChanged={load} onPrint={setPrintRecord} />
        ))}
      </div>

      {printRecord && <PinjamanAsetPrintModal record={printRecord} onClose={() => setPrintRecord(null)} />}
    </div>
  );
}
