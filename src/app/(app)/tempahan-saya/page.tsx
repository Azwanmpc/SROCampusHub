import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingCard from "@/components/BookingCard";

export default async function TempahanSayaPage() {
  const session = await getSession();
  if (!session) return null;

  const bookings = await prisma.booking.findMany({
    where: { userId: session.userId },
    include: { facility: true, user: true },
    orderBy: { startDateTime: "desc" },
  });

  const bookingsForClient = bookings.map((b) => ({
    ...b,
    startDateTime: b.startDateTime.toISOString(),
    endDateTime: b.endDateTime.toISOString(),
    checkInAt: b.checkInAt ? b.checkInAt.toISOString() : null,
    checkOutAt: b.checkOutAt ? b.checkOutAt.toISOString() : null,
  }));

  return (
    <div>
      <div className="mb-0.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="font-archivo text-[26px] font-extrabold">Tempahan Saya</div>
      </div>
      <div className="mb-[18px] mt-3.5 h-0.5 bg-[rgba(32,30,29,0.4)]" />

      <div className="flex flex-col gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.3)]">
        {bookingsForClient.length === 0 && (
          <div className="bg-white p-4 text-sm text-[rgba(32,30,29,0.5)]">Belum ada tempahan.</div>
        )}
        {bookingsForClient.map((b) => (
          <BookingCard key={b.id} booking={b} canApprove={false} showCancel />
        ))}
      </div>
    </div>
  );
}
