import { prisma } from "@/lib/prisma";
import BookingApprovalList from "@/components/BookingApprovalList";

export default async function KelulusanPage() {
  const bookings = await prisma.booking.findMany({
    include: { facility: true, user: true },
    orderBy: [{ status: "asc" }, { startDateTime: "asc" }],
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
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Kelulusan Tempahan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">Sahkan atau tolak permohonan tempahan fasiliti</div>
      <div className="mb-4 h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />
      <BookingApprovalList bookings={bookingsForClient} />
    </div>
  );
}
