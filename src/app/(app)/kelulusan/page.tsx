import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { ApproveRejectButtons, CheckInOutButtons } from "@/components/BookingActions";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR, ARRANGEMENT_LABEL } from "@/lib/constants";

export default async function KelulusanPage() {
  const bookings = await prisma.booking.findMany({
    include: { facility: true, user: true },
    orderBy: [{ status: "asc" }, { startDateTime: "asc" }],
  });

  const menunggu = bookings.filter((b) => b.status === "MENUNGGU");
  const lain = bookings.filter((b) => b.status !== "MENUNGGU");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Kelulusan Tempahan</h1>
      <p className="mb-6 text-sm text-slate-500">Sahkan atau tolak tempahan fasiliti yang diterima.</p>

      <h2 className="mb-3 text-sm font-bold text-slate-700">Menunggu Pengesahan ({menunggu.length})</h2>
      <div className="mb-8 flex flex-col gap-3">
        {menunggu.length === 0 && <p className="text-sm text-slate-400">Tiada tempahan menunggu.</p>}
        {menunggu.map((b) => (
          <div key={b.id} className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-slate-800">{b.facility.name}</div>
                <div className="text-xs text-slate-500">{b.purpose} &middot; oleh {b.user.name}</div>
              </div>
              <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
              <div>Mula: {new Date(b.startDateTime).toLocaleString("ms-MY")}</div>
              <div>Tamat: {new Date(b.endDateTime).toLocaleString("ms-MY")}</div>
              <div>Peserta: {b.participantCount}</div>
              <div>Susunan: {ARRANGEMENT_LABEL[b.arrangement]}</div>
            </div>
            {(b.addOnProjector > 0 || b.addOnTv100 > 0) && (
              <div className="mb-3 text-xs text-slate-500">
                Add-on: {b.addOnProjector > 0 ? `${b.addOnProjector} LCD Projektor ` : ""}
                {b.addOnTv100 > 0 ? `${b.addOnTv100} TV LCD 100"` : ""}
              </div>
            )}
            {b.earlyAccess && (
              <div className="mb-3 text-xs text-amber-700">
                Minta masuk awal {b.earlyAccessMinutes} minit
              </div>
            )}
            <ApproveRejectButtons bookingId={b.id} />
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-bold text-slate-700">Sejarah Tempahan</h2>
      <div className="flex flex-col gap-3">
        {lain.map((b) => (
          <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-slate-800">{b.facility.name}</div>
                <div className="text-xs text-slate-500">{b.purpose} &middot; oleh {b.user.name}</div>
              </div>
              <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
            </div>
            <div className="mb-2 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
              <div>Mula: {new Date(b.startDateTime).toLocaleString("ms-MY")}</div>
              <div>Tamat: {new Date(b.endDateTime).toLocaleString("ms-MY")}</div>
              <div>Peserta: {b.participantCount}</div>
              <div>RM {b.revenue.toLocaleString("ms-MY")}</div>
            </div>
            {b.status === "DISAHKAN" && b.facility.type === "Asrama" && (
              <CheckInOutButtons
                bookingId={b.id}
                checkInAt={b.checkInAt ? b.checkInAt.toISOString() : null}
                checkOutAt={b.checkOutAt ? b.checkOutAt.toISOString() : null}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
