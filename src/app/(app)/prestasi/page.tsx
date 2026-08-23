import { prisma } from "@/lib/prisma";

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export default async function PrestasiPage() {
  const complaints = await prisma.complaint.findMany({
    include: { facility: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const selesai = complaints.filter((c) => c.status === "SELESAI");
  const belumSelesai = complaints.filter((c) => c.status !== "SELESAI");
  const staffDalaman = complaints.filter((c) => c.repairType === "DALAMAN" && c.status !== "SELESAI");
  const kontraktorLuar = complaints.filter((c) => c.repairType === "KONTRAKTOR" && c.status !== "SELESAI");

  const cards = [
    { label: "Selesai", value: selesai.length, color: "#4a8a63" },
    { label: "Belum Selesai", value: belumSelesai.length, color: "#7c1405" },
    { label: "Staff Dalaman", value: staffDalaman.length, color: "#8a6d1f" },
    { label: "Kontraktor Luar", value: kontraktorLuar.length, color: "#4a72a8" },
  ];

  const pendingDalaman = complaints
    .filter((c) => c.status !== "SELESAI" && c.repairType === "DALAMAN")
    .map((c) => ({ ...c, hariPending: daysBetween(c.createdAt, now) }))
    .sort((a, b) => b.hariPending - a.hariPending);

  const pendingKontraktor = complaints
    .filter((c) => c.status !== "SELESAI" && c.repairType === "KONTRAKTOR")
    .map((c) => ({ ...c, hariPending: daysBetween(c.createdAt, now) }))
    .sort((a, b) => b.hariPending - a.hariPending);

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Prestasi Penyelenggaraan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">Jejak prestasi dalaman vs kontraktor</div>
      <div className="mb-5 h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />

      <div className="mb-5 grid grid-cols-2 gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.4)] md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[var(--white)] p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.6)]">{c.label}</div>
            <div className="font-archivo text-[26px] font-extrabold" style={{ color: c.color }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-[18px]">
        <div className="mb-3 font-archivo text-sm font-extrabold">Untuk Tindakan (Susun Ikut Tempoh Pending)</div>
        <div className="grid grid-cols-1 gap-px border border-[rgba(var(--ink-rgb),0.3)] bg-[rgba(var(--ink-rgb),0.3)] md:grid-cols-2">
          <div className="bg-[var(--white)] p-3.5">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.03em] text-[rgba(var(--ink-rgb),0.6)]">Staf Penyelenggaraan</div>
            {pendingDalaman.length === 0 && <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada aduan pending.</p>}
            {pendingDalaman.map((c) => (
              <div key={c.id} className="flex items-center gap-3 border-b border-[rgba(var(--ink-rgb),0.15)] py-2.5 last:border-0">
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{c.location}</div>
                  <div className="text-[11.5px] text-[rgba(var(--ink-rgb),0.6)]">{c.description}</div>
                </div>
                <div className="text-xs font-bold" style={{ color: c.hariPending > 2 ? "#7c1405" : "#8a6d1f" }}>
                  {c.hariPending} hari
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[var(--white)] p-3.5">
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.03em] text-[rgba(var(--ink-rgb),0.6)]">Kontraktor Luar</div>
            {pendingKontraktor.length === 0 && <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada aduan pending.</p>}
            {pendingKontraktor.map((c) => (
              <div key={c.id} className="flex items-center gap-3 border-b border-[rgba(var(--ink-rgb),0.15)] py-2.5 last:border-0">
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{c.location}</div>
                  <div className="text-[11.5px] text-[rgba(var(--ink-rgb),0.6)]">{c.description}</div>
                </div>
                <div className="text-xs font-bold" style={{ color: c.hariPending > 2 ? "#7c1405" : "#8a6d1f" }}>
                  {c.hariPending} hari
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
