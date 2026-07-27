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
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
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

  const [bookings, complaints, facilities] = await Promise.all([
    prisma.booking.findMany({ where: { status: "DISAHKAN" } }),
    prisma.complaint.findMany(),
    prisma.facility.findMany(),
  ]);

  const monthly = months.map(({ key, label, year, month }) => {
    const monthBookings = bookings.filter((b) => {
      const d = new Date(b.startDateTime);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const monthComplaints = complaints.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const resolved = monthComplaints.filter((c) => c.status === "SELESAI").length;
    const revenue = monthBookings.reduce((sum, b) => sum + b.revenue, 0);
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

  const revenueByFacility = facilities
    .map((f) => ({
      name: f.name,
      revenue: bookings.filter((b) => b.facilityId === f.id).reduce((sum, b) => sum + b.revenue, 0),
    }))
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

  return NextResponse.json({ monthly, facilitiesDown, repairTypeBreakdown, hasilByFacility, locationBreakdown, hasilByMonth, kosByMonth });
}
