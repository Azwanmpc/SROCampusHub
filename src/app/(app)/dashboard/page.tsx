import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_COLOR,
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_STATUS_COLOR,
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_COLOR,
} from "@/lib/constants";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const isStaff = session.role === "SUPERADMIN" || session.role === "ADMIN";

  if (isStaff) {
    const [pendingBookings, activeComplaints, maintenanceFacilities, allBookings, recentBookings, recentComplaints] =
      await Promise.all([
        prisma.booking.count({ where: { status: "MENUNGGU" } }),
        prisma.complaint.count({ where: { status: { not: "SELESAI" } } }),
        prisma.facility.count({ where: { status: "PENYELENGGARAAN" } }),
        prisma.booking.findMany({ where: { status: "DISAHKAN" } }),
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

    const hasil = allBookings.reduce((sum, b) => sum + b.revenue, 0);

    return (
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-800">Dashboard {session.role === "SUPERADMIN" ? "Superadmin" : "Admin"}</h1>
        <p className="mb-6 text-sm text-slate-500">Selamat kembali, {session.name}.</p>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Tempahan Menunggu Kelulusan" value={pendingBookings} />
          <StatCard label="Aduan Aktif" value={activeComplaints} />
          <StatCard label="Fasiliti Dalam Penyelenggaraan" value={maintenanceFacilities} />
          <StatCard label="Jumlah Hasil Sewaan" value={`RM ${hasil.toLocaleString("ms-MY")}`} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">Tempahan Menunggu Kelulusan</h2>
              <Link href="/kelulusan" className="text-xs font-semibold text-indigo-700 hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentBookings.length === 0 && <p className="text-sm text-slate-400">Tiada tempahan menunggu.</p>}
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{b.facility.name}</div>
                    <div className="text-xs text-slate-500">{b.user.name} &middot; {new Date(b.startDateTime).toLocaleDateString("ms-MY")}</div>
                  </div>
                  <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">Aduan Terkini</h2>
              <Link href="/aduan" className="text-xs font-semibold text-indigo-700 hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentComplaints.length === 0 && <p className="text-sm text-slate-400">Tiada aduan.</p>}
              {recentComplaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{c.location}</div>
                    <div className="text-xs text-slate-500">{c.user.name} &middot; {new Date(c.createdAt).toLocaleDateString("ms-MY")}</div>
                  </div>
                  <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
                </div>
              ))}
            </div>
          </div>
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
    const upcoming = bookings.filter(
      (b) => b.status === "DISAHKAN" && new Date(b.startDateTime) > new Date()
    );

    return (
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-800">Dashboard Pemohon</h1>
        <p className="mb-6 text-sm text-slate-500">Selamat kembali, {session.name}.</p>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Jumlah Tempahan" value={bookings.length} />
          <StatCard label="Menunggu Pengesahan" value={bookings.filter((b) => b.status === "MENUNGGU").length} />
          <StatCard label="Akan Datang (Disahkan)" value={upcoming.length} />
        </div>

        {upcoming.length > 0 && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h2 className="mb-2 text-sm font-bold text-blue-800">Peringatan Tempahan Akan Datang</h2>
            {upcoming.slice(0, 3).map((b) => (
              <div key={b.id} className="text-sm text-blue-700">
                {b.facility.name} — {new Date(b.startDateTime).toLocaleString("ms-MY")}
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Senarai Tempahan Saya</h2>
            <Link href="/tempahan-saya" className="text-xs font-semibold text-indigo-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {bookings.length === 0 && <p className="text-sm text-slate-400">Belum ada tempahan. <Link href="/kalendar" className="text-indigo-700 hover:underline">Buat tempahan</Link></p>}
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{b.facility.name}</div>
                  <div className="text-xs text-slate-500">{b.purpose} &middot; {new Date(b.startDateTime).toLocaleDateString("ms-MY")}</div>
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

    return (
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-800">Dashboard Staf Penyelenggaraan</h1>
        <p className="mb-6 text-sm text-slate-500">Selamat kembali, {session.name}.</p>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatCard label="Jumlah Aduan" value={complaints.length} />
          <StatCard label="Belum Selesai" value={complaints.filter((c) => c.status !== "SELESAI").length} />
          <StatCard label="Selesai" value={complaints.filter((c) => c.status === "SELESAI").length} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">Aduan Terkini</h2>
            <Link href="/aduan" className="text-xs font-semibold text-indigo-700 hover:underline">
              Urus semua aduan
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {complaints.length === 0 && <p className="text-sm text-slate-400">Tiada aduan.</p>}
            {complaints.slice(0, 8).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{c.location}</div>
                  <div className="text-xs text-slate-500">
                    {c.user.name} &middot; {new Date(c.createdAt).toLocaleDateString("ms-MY")}
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

  // PENGADU
  const complaints = await prisma.complaint.findMany({
    where: { userId: session.userId },
    include: { facility: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Dashboard Pengadu</h1>
      <p className="mb-6 text-sm text-slate-500">Selamat kembali, {session.name}.</p>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Jumlah Aduan" value={complaints.length} />
        <StatCard label="Belum Selesai" value={complaints.filter((c) => c.status !== "SELESAI").length} />
        <StatCard label="Selesai" value={complaints.filter((c) => c.status === "SELESAI").length} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Senarai Aduan Saya</h2>
          <Link href="/aduan" className="text-xs font-semibold text-indigo-700 hover:underline">
            Buat aduan baharu
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {complaints.length === 0 && <p className="text-sm text-slate-400">Belum ada aduan.</p>}
          {complaints.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <div className="text-sm font-semibold text-slate-800">{c.location}</div>
                <div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleDateString("ms-MY")}</div>
              </div>
              <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
