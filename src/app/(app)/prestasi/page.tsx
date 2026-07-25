import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { COMPLAINT_STATUS_LABEL, COMPLAINT_STATUS_COLOR, REPAIR_TYPE_LABEL } from "@/lib/constants";

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

export default async function PrestasiPage() {
  const complaints = await prisma.complaint.findMany({
    include: { facility: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const belumSelesai = complaints.filter((c) => c.status !== "SELESAI");
  const selesai = complaints.filter((c) => c.status === "SELESAI");

  const byType = ["DALAMAN", "KONTRAKTOR"].map((type) => {
    const items = complaints.filter((c) => c.repairType === type);
    const done = items.filter((c) => c.status === "SELESAI" && c.resolvedAt);
    const avgDays =
      done.length > 0
        ? Math.round(
            (done.reduce((sum, c) => sum + daysBetween(c.createdAt, c.resolvedAt as Date), 0) / done.length) * 10
          ) / 10
        : null;
    return {
      type,
      total: items.length,
      selesai: items.filter((c) => c.status === "SELESAI").length,
      belumSelesai: items.filter((c) => c.status !== "SELESAI").length,
      avgDays,
    };
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Prestasi Penyelenggaraan</h1>
      <p className="mb-6 text-sm text-slate-500">Jejak status kerja pembaikan dan prestasi mengikut jenis.</p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {byType.map((t) => (
          <div key={t.type} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 text-sm font-bold text-slate-800">{REPAIR_TYPE_LABEL[t.type]}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-slate-800">{t.total}</div>
                <div className="text-xs text-slate-400">Jumlah</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{t.selesai}</div>
                <div className="text-xs text-slate-400">Selesai</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600">{t.belumSelesai}</div>
                <div className="text-xs text-slate-400">Pending</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Purata masa penyelesaian: {t.avgDays !== null ? `${t.avgDays} hari` : "Tiada data"}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-bold text-slate-700">Belum Selesai ({belumSelesai.length})</h2>
      <div className="mb-8 flex flex-col gap-3">
        {belumSelesai.length === 0 && <p className="text-sm text-slate-400">Semua aduan telah diselesaikan.</p>}
        {belumSelesai.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold text-slate-800">{c.location}</div>
              <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
            </div>
            <div className="text-xs text-slate-500">
              {c.repairType ? REPAIR_TYPE_LABEL[c.repairType] : "Belum ditetapkan"} &middot;{" "}
              {daysBetween(c.createdAt, now)} hari pending
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-bold text-slate-700">Selesai ({selesai.length})</h2>
      <div className="flex flex-col gap-3">
        {selesai.map((c) => (
          <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold text-slate-800">{c.location}</div>
              <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
            </div>
            <div className="text-xs text-slate-500">
              {c.repairType ? REPAIR_TYPE_LABEL[c.repairType] : ""} &middot; Diselesaikan dalam{" "}
              {c.resolvedAt ? daysBetween(c.createdAt, c.resolvedAt) : "-"} hari
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
