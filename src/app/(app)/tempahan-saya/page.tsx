import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import { CancelBookingButton } from "@/components/BookingActions";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR, ARRANGEMENT_LABEL } from "@/lib/constants";

export default async function TempahanSayaPage() {
  const session = await getSession();
  if (!session) return null;

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    include: { facility: true },
    orderBy: { startDateTime: "desc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Tempahan Saya</h1>
      <p className="mb-6 text-sm text-slate-500">Senarai semua tempahan fasiliti yang anda buat.</p>

      <div className="flex flex-col gap-3">
        {bookings.length === 0 && (
          <p className="text-sm text-slate-400">Belum ada tempahan.</p>
        )}
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-slate-800">{b.facility.name}</div>
                <div className="text-xs text-slate-500">{b.purpose}</div>
              </div>
              <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
              <div>Mula: {new Date(b.startDateTime).toLocaleString("ms-MY")}</div>
              <div>Tamat: {new Date(b.endDateTime).toLocaleString("ms-MY")}</div>
              <div>Peserta: {b.participantCount}</div>
              <div>Susunan: {ARRANGEMENT_LABEL[b.arrangement]}</div>
            </div>
            {b.status === "DITOLAK" && b.rejectionReason && (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                Sebab ditolak: {b.rejectionReason}
              </div>
            )}
            {b.status === "MENUNGGU" && <CancelBookingButton bookingId={b.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
