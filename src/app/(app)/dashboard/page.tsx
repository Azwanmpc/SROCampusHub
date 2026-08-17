import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  CalendarCheck,
  Wrench,
  WarningCircle,
  Buildings,
  MoneyWavy,
} from "@phosphor-icons/react/dist/ssr";
import StatusBadge from "@/components/StatusBadge";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_COLOR,
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_STATUS_COLOR,
  ROLE_LABEL,
} from "@/lib/constants";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconColor = "#6d28d9",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  iconColor?: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.6)]">{label}</div>
        {Icon && <Icon weight="duotone" size={20} color={iconColor} />}
      </div>
      <div className="font-archivo text-[26px] font-extrabold">{value}</div>
      {hint && <div className="mt-0.5 text-[11.5px] text-[rgba(32,30,29,0.55)]">{hint}</div>}
    </div>
  );
}

function CardsGrid({ children }: { children: React.ReactNode }) {
  return <div className="mb-6 grid grid-cols-2 gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.4)] md:grid-cols-4">{children}</div>;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "PENGADU") redirect("/aduan");
  if (session.role === "PEMINJAM") redirect("/pinjaman-aset");
  const isStaff = session.role === "SUPERADMIN" || session.role === "ADMIN" || session.role === "STAFF_MPC";

  if (isStaff) {
    const currentYear = new Date().getFullYear();
    const [pendingBookings, activeComplaints, maintenanceFacilities, hasilSewaanRecords, recentBookings, recentComplaints] =
      await Promise.all([
        prisma.booking.count({ where: { status: "MENUNGGU" } }),
        prisma.complaint.count({ where: { status: { not: "SELESAI" } } }),
        prisma.facility.count({ where: { status: "PENYELENGGARAAN" } }),
        // Hasil Sewaan (RM) is always sourced from the HasilSewaan ledger (Dashboard Hasil's own
        // data) so every dashboard that surfaces this figure stays in sync with a single source of truth.
        // Scoped to the current year only — not a cumulative all-time total.
        prisma.hasilSewaan.findMany({
          where: { tarikh: { gte: new Date(currentYear, 0, 1), lt: new Date(currentYear + 1, 0, 1) } },
        }),
        prisma.booking.findMany({
          where: { status: "MENUNGGU" },
          include: { facility: true, user: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.complaint.findMany({
          include: { facility: true, user: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    const hasil = hasilSewaanRecords.reduce((sum, h) => sum + h.hasilTerimaan, 0);

    return (
      <div>
        <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard</div>
        <div className="mb-4 text-[13.5px] text-[rgba(32,30,29,0.6)]">
          Selamat kembali, {session.name} — {ROLE_LABEL[session.role] ?? session.role}
        </div>
        <div className="mb-[22px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

        <CardsGrid>
          <StatCard label="Tempahan Menunggu" value={pendingBookings} icon={CalendarCheck} iconColor="#4a72a8" />
          <StatCard label="Aduan Aktif" value={activeComplaints} icon={WarningCircle} iconColor="#7c1405" />
          <StatCard label="Fasiliti Penyelenggaraan" value={maintenanceFacilities} icon={Wrench} iconColor="#8a6d1f" />
          <StatCard label={`Hasil Sewaan Tahun Semasa (${currentYear})`} value={`RM ${hasil.toLocaleString("ms-MY")}`} icon={MoneyWavy} iconColor="#4a8a63" />
        </CardsGrid>

        <div className="grid grid-cols-1 gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.4)] lg:grid-cols-2">
          <div className="bg-white p-[18px]">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-archivo text-sm font-extrabold">Tempahan Menunggu Kelulusan</div>
              <Link href="/kelulusan" className="text-xs font-bold text-[#6d28d9] hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-[rgba(32,30,29,0.15)]">
              {recentBookings.length === 0 && <p className="py-2 text-sm text-[rgba(32,30,29,0.5)]">Tiada tempahan menunggu.</p>}
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-bold">{b.facility.name}</div>
                    <div className="text-xs text-[rgba(32,30,29,0.55)]">
                      {b.user.name} &middot; {new Date(b.startDateTime).toLocaleDateString("ms-MY")}
                    </div>
                  </div>
                  <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-[18px]">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-archivo text-sm font-extrabold">Aduan Terkini</div>
              <Link href="/aduan" className="text-xs font-bold text-[#6d28d9] hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-[rgba(32,30,29,0.15)]">
              {recentComplaints.length === 0 && <p className="py-2 text-sm text-[rgba(32,30,29,0.5)]">Tiada aduan.</p>}
              {recentComplaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <div className="text-sm font-bold">{c.location}</div>
                    <div className="text-xs text-[rgba(32,30,29,0.55)]">
                      {c.user?.name ?? c.guestName ?? "Awam"} &middot; {new Date(c.createdAt).toLocaleDateString("ms-MY")}
                    </div>
                  </div>
                  <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3.5 text-right">
          <Link href="/laporan" className="text-xs font-bold text-[#6d28d9] hover:underline">
            Lihat laporan &amp; analitik penuh →
          </Link>
        </div>
      </div>
    );
  }

  if (session.role === "PEMOHON") {
    const bookings = await prisma.booking.findMany({
      where: { userId: session.userId },
      include: { facility: true },
      orderBy: { startDateTime: "desc" },
      take: 8,
    });
    const upcoming = bookings.filter((b) => b.status === "DISAHKAN" && new Date(b.startDateTime) > new Date());

    return (
      <div>
        <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard</div>
        <div className="mb-4 text-[13.5px] text-[rgba(32,30,29,0.6)]">Selamat kembali, {session.name} — Pemohon</div>
        <div className="mb-[22px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

        <div className="mb-6 grid grid-cols-2 gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.4)] md:grid-cols-3">
          <StatCard label="Jumlah Tempahan" value={bookings.length} icon={Buildings} iconColor="#4a72a8" />
          <StatCard label="Menunggu Pengesahan" value={bookings.filter((b) => b.status === "MENUNGGU").length} icon={CalendarCheck} iconColor="#8a6d1f" />
          <StatCard label="Akan Datang (Disahkan)" value={upcoming.length} icon={CalendarCheck} iconColor="#4a8a63" />
        </div>

        {upcoming.length > 0 && (
          <div className="mb-6 border border-[rgba(32,30,29,0.4)] bg-white p-[18px]">
            <div className="mb-3 font-archivo text-sm font-extrabold">Tempahan Akan Datang</div>
            {upcoming.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center gap-3 border-b border-[rgba(32,30,29,0.2)] py-2.5 last:border-0">
                <CalendarCheck weight="duotone" size={20} color="#4a8a63" />
                <div className="flex-1">
                  <div className="text-[13.5px] font-bold">{b.facility.name}</div>
                  <div className="text-xs text-[rgba(32,30,29,0.6)]">{new Date(b.startDateTime).toLocaleString("ms-MY")}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border border-[rgba(32,30,29,0.4)] bg-white p-[18px]">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-archivo text-sm font-extrabold">Senarai Tempahan Saya</div>
            <Link href="/tempahan-saya" className="text-xs font-bold text-[#6d28d9] hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-[rgba(32,30,29,0.15)]">
            {bookings.length === 0 && (
              <p className="py-2 text-sm text-[rgba(32,30,29,0.5)]">
                Belum ada tempahan.{" "}
                <Link href="/kalendar" className="font-bold text-[#6d28d9] hover:underline">
                  Buat tempahan
                </Link>
              </p>
            )}
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-bold">{b.facility.name}</div>
                  <div className="text-xs text-[rgba(32,30,29,0.55)]">
                    {b.purpose} &middot; {new Date(b.startDateTime).toLocaleDateString("ms-MY")}
                  </div>
                </div>
                <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (session.role === "TEKNIKAL") {
    const complaints = await prisma.complaint.findMany({
      include: { facility: true, user: true },
      orderBy: { createdAt: "desc" },
    });
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);

    const staffActiveCount = complaints.filter((c) => c.status !== "SELESAI").length;
    const staffDoneThisMonth = complaints.filter((c) => c.status === "SELESAI" && c.resolvedAt && c.resolvedAt >= startOfMonth).length;
    const staffNewCount = complaints.filter((c) => c.createdAt >= threeDaysAgo).length;
    const staffDalamTindakanCount = complaints.filter((c) => c.status === "DALAM_TINDAKAN").length;

    return (
      <div>
        <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard Penyelenggaraan</div>
        <div className="mb-4 text-[13.5px] text-[rgba(32,30,29,0.6)]">Ringkasan kerja penyelenggaraan, {session.name}</div>
        <div className="mb-[22px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

        <CardsGrid>
          <StatCard label="Belum Selesai" value={staffActiveCount} icon={WarningCircle} iconColor="#6d28d9" />
          <StatCard label="Selesai Bulan Ini" value={staffDoneThisMonth} icon={CalendarCheck} iconColor="#4a8a63" />
          <StatCard label="Aduan Baru" value={staffNewCount} hint="Dalam tempoh 3 hari" icon={WarningCircle} iconColor="#4a72a8" />
          <StatCard label="Dalam Tindakan" value={staffDalamTindakanCount} icon={Wrench} iconColor="#8a6d1f" />
        </CardsGrid>

        <div className="border border-[rgba(32,30,29,0.4)] bg-white p-[18px]">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-archivo text-sm font-extrabold">Aduan Terkini</div>
            <Link href="/aduan" className="text-xs font-bold text-[#6d28d9] hover:underline">
              Urus semua aduan
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-[rgba(32,30,29,0.15)]">
            {complaints.length === 0 && <p className="py-2 text-sm text-[rgba(32,30,29,0.5)]">Tiada aduan.</p>}
            {complaints.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-bold">{c.location}</div>
                  <div className="text-xs text-[rgba(32,30,29,0.55)]">
                    {c.user?.name ?? c.guestName ?? "Awam"} &middot; {new Date(c.createdAt).toLocaleDateString("ms-MY")}
                  </div>
                </div>
                <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
