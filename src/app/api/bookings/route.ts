import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const isStaff = session.role === "SUPERADMIN" || session.role === "ADMIN";
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId") ?? undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      ...(isStaff ? {} : { userId: session.userId }),
      ...(facilityId ? { facilityId } : {}),
    },
    include: { facility: true, user: true },
    orderBy: { startDateTime: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });
  if (session.role === "PENGADU" || session.role === "TEKNIKAL") {
    return NextResponse.json({ error: "Peranan ini tidak boleh membuat tempahan" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak sah" }, { status: 400 });
  }

  const data = parsed.data;
  const start = new Date(data.startDateTime);
  const end = new Date(data.endDateTime);

  if (end <= start) {
    return NextResponse.json({ error: "Masa tamat mesti selepas masa mula" }, { status: 400 });
  }

  const facility = await prisma.facility.findUnique({ where: { id: data.facilityId } });
  if (!facility) return NextResponse.json({ error: "Fasiliti tidak dijumpai" }, { status: 404 });
  if (facility.status === "PENYELENGGARAAN") {
    return NextResponse.json({ error: "Fasiliti sedang dalam penyelenggaraan" }, { status: 400 });
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      facilityId: data.facilityId,
      status: { in: ["MENUNGGU", "DISAHKAN"] },
      startDateTime: { lt: end },
      endDateTime: { gt: start },
    },
  });
  if (overlap) {
    return NextResponse.json({ error: "Slot masa ini bertindih dengan tempahan sedia ada" }, { status: 409 });
  }

  const booking = await prisma.booking.create({
    data: {
      facilityId: data.facilityId,
      userId: session.userId,
      startDateTime: start,
      endDateTime: end,
      purpose: data.purpose,
      participantCount: data.participantCount,
      arrangement: data.arrangement,
      addOnProjector: data.addOnProjector,
      addOnTv100: data.addOnTv100,
      earlyAccess: data.earlyAccess,
      earlyAccessMinutes: data.earlyAccessMinutes,
      roomNumber: data.roomNumber,
      revenue: facility.costPerUse,
    },
    include: { facility: true, user: true },
  });

  await sendWhatsAppNotification({
    userId: session.userId,
    bookingId: booking.id,
    phone: booking.user.phone,
    type: "TEMPAHAN_DITERIMA",
    message: `Tempahan anda untuk ${facility.name} pada ${start.toLocaleDateString("ms-MY")} telah diterima dan sedang menunggu pengesahan admin.`,
  });

  return NextResponse.json(booking);
}
