import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const MONTH_LABEL = [
  "Jan", "Feb", "Mac", "Apr", "Mei", "Jun",
  "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis",
];

// Dummy cost model: kontraktor luar dianggarkan RM500/kes, pembaikan dalaman RM150/kes.
const REPAIR_COST: Record<string, number> = { KONTRAKTOR: 500, DALAMAN: 150 };

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN" && session.role !== "STAFF_MPC")) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const now = new Date();
  const months: { key: string; label: string; year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTH_LABEL[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }

  const [complaints, facilities, hasilSewaan] = await Promise.all([
    prisma.complaint.findMany(),
    prisma.facility.findMany(),
    // Hasil Sewaan (RM) is always sourced from the HasilSewaan ledger (Dashboard Hasil's own
    // data) so every dashboard that surfaces this figure stays in sync with a single source of truth.
    prisma.hasilSewaan.findMany(),
  ]);

  const monthly = months.map(({ key, label, year, month }) => {
    const monthHasil = hasilSewaan.filter((h) => {
      const d = new Date(h.tarikh);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const monthComplaints = complaints.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const resolved = monthComplaints.filter((c) => c.status === "SELESAI").length;
    const revenue = monthHasil.reduce((sum, h) => sum + h.hasilTerimaan, 0);
    const maintenanceCost = monthComplaints.reduce(
      (sum, c) => sum + (c.repairType ? REPAIR_COST[c.repairType] ?? 150 : 0),
      0
    );

    return {
      key,
      label,
      aduan: monthComplaints.length,
      selesai: resolved,
      hasil: revenue,
      kosPenyelenggaraan: maintenanceCost,
    };
  });

  const facilitiesDown = facilities
    .filter((f) => f.status === "PENYELENGGARAAN")
    .map((f) => ({ id: f.id, name: f.name, type: f.type }));

  const lokasiRevenueMap = new Map<string, number>();
  for (const h of hasilSewaan) {
    lokasiRevenueMap.set(h.lokasi, (lokasiRevenueMap.get(h.lokasi) ?? 0) + h.hasilTerimaan);
  }
  const revenueByFacility = [...lokasiRevenueMap.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .filter((f) => f.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);
  const maxFacilityRevenue = Math.max(1, ...revenueByFacility.map((f) => f.revenue));
  const hasilByFacility = revenueByFacility.map((f) => ({
    nama: f.name,
    rmLabel: `RM ${f.revenue.toLocaleString("ms-MY")}`,
    pct: Math.round((f.revenue / maxFacilityRevenue) * 100),
  }));

  const locationCounts = new Map<string, number>();
  for (const c of complaints) {
    locationCounts.set(c.location, (locationCounts.get(c.location) ?? 0) + 1);
  }
  const totalComplaintsCount = complaints.length || 1;
  const locationBreakdown = [...locationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lokasi, count]) => ({ lokasi, count, pct: Math.round((count / totalComplaintsCount) * 100) }));

  const repairTypeBreakdown = ["DALAMAN", "KONTRAKTOR"].map((type) => {
    const items = complaints.filter((c) => c.repairType === type);
    const resolvedItems = items.filter((c) => c.status === "SELESAI" && c.resolvedAt);
    const avgDays =
      resolvedItems.length > 0
        ? resolvedItems.reduce((sum, c) => {
            const days = (new Date(c.resolvedAt as Date).getTime() - new Date(c.createdAt).getTime()) / 86400000;
            return sum + days;
          }, 0) / resolvedItems.length
        : 0;
    return {
      type,
      total: items.length,
      selesai: items.filter((c) => c.status === "SELESAI").length,
      belumSelesai: items.filter((c) => c.status !== "SELESAI").length,
      purataHariSiap: Math.round(avgDays * 10) / 10,
    };
  });

  const maxMonthlyRevenue = Math.max(1, ...monthly.map((m) => m.hasil));
  const hasilByMonth = monthly.map((m) => ({ label: m.label, rmLabel: `RM ${m.hasil.toLocaleString("ms-MY")}`, pct: Math.round((m.hasil / maxMonthlyRevenue) * 100) }));
  const maxMonthlyCost = Math.max(1, ...monthly.map((m) => m.kosPenyelenggaraan));
  const kosByMonth = monthly.map((m) => ({ label: m.label, kosLabel: `RM ${m.kosPenyelenggaraan.toLocaleString("ms-MY")}`, kosPct: Math.round((m.kosPenyelenggaraan / maxMonthlyCost) * 100) }));

  const recurringMap = new Map<string, { lokasi: string; isu: string; bil: number; kos: number }>();
  for (const c of complaints) {
    const key = `${c.location}|${c.description}`;
    const entry = recurringMap.get(key) ?? { lokasi: c.location, isu: c.description, bil: 0, kos: 0 };
    entry.bil += 1;
    entry.kos += c.estimatedCost;
    recurringMap.set(key, entry);
  }
  const recurringComplaints = [...recurringMap.values()]
    .sort((a, b) => b.bil - a.bil)
    .slice(0, 5)
    .map((r) => ({ ...r, kosLabel: `RM ${r.kos.toLocaleString("ms-MY")}` }));

  const ORG_COLORS = ["#4a72a8", "#4a8a63", "#8a6d1f", "#7c1405", "#6d28d9", "#5b3a8a", "#605d5d"];
  // Top Organisasi Penyewa Fasiliti is sourced from the same HasilSewaan ledger as Dashboard
  // Hasil, ranked by hasil (RM) rather than booking count, so it stays in sync with that dashboard.
  const orgRevenueMap = new Map<string, number>();
  for (const h of hasilSewaan) {
    if (h.organisasi) orgRevenueMap.set(h.organisasi, (orgRevenueMap.get(h.organisasi) ?? 0) + h.hasilTerimaan);
  }
  const orgTotalRevenue = [...orgRevenueMap.values()].reduce((a, n) => a + n, 0) || 1;
  let orgAcc = 0;
  const topOrganisasi = [...orgRevenueMap.entries()]
    .map(([label, revenue]) => ({ label, bil: revenue, pct: Math.round((revenue / orgTotalRevenue) * 100) }))
    .sort((a, b) => b.bil - a.bil)
    .slice(0, 5)
    .map((o, i) => {
      const seg = { ...o, color: ORG_COLORS[i % ORG_COLORS.length], from: orgAcc, to: orgAcc + o.pct };
      orgAcc += o.pct;
      return seg;
    });
  const orgRentalGradient =
    topOrganisasi.length > 0
      ? `conic-gradient(${topOrganisasi.map((o) => `${o.color} ${o.from}% ${o.to}%`).join(", ")})`
      : "#e2e1e0";

  return NextResponse.json({
    monthly,
    facilitiesDown,
    repairTypeBreakdown,
    hasilByFacility,
    locationBreakdown,
    hasilByMonth,
    kosByMonth,
    recurringComplaints,
    topOrganisasi,
    orgRentalGradient,
  });
}
