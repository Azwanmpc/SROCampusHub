import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { bookingSchema } from "@/lib/validation";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { ASRAMA_ROOM_TYPES } from "@/lib/facilityRates";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId") ?? undefined;

  // Every logged-in role sees all bookings here (not just their own) so the
  // shared calendar can show which slots are already taken (MENUNGGU/DISAHKAN).
  const bookings = await prisma.booking.findMany({
    where: {
      ...(facilityId ? { facilityId } : {}),
    },
    select: {
      id: true,
      facilityId: true,
      startDateTime: true,
      endDateTime: true,
      purpose: true,
      status: true,
      facility: { select: { id: true, name: true, type: true } },
      user: { select: { id: true, name: true } },
    },
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

  if (facility.type === "Asrama") {
    const requestedRooms = data.asramaRoomsJson
      ? (JSON.parse(data.asramaRoomsJson) as { key: string; qty: number }[])
      : [];
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        facilityId: data.facilityId,
        status: { in: ["MENUNGGU", "DISAHKAN"] },
        startDateTime: { lt: end },
        endDateTime: { gt: start },
      },
      select: { asramaRoomsJson: true },
    });
    const booked: Record<string, number> = {};
    for (const b of overlappingBookings) {
      if (!b.asramaRoomsJson) continue;
      try {
        const rooms = JSON.parse(b.asramaRoomsJson) as { key: string; qty: number }[];
        for (const r of rooms) booked[r.key] = (booked[r.key] ?? 0) + r.qty;
      } catch {
        // ignore malformed data
      }
    }
    for (const rt of ASRAMA_ROOM_TYPES) {
      const requestedQty = requestedRooms.find((r) => r.key === rt.key)?.qty ?? 0;
      const alreadyBooked = booked[rt.key] ?? 0;
      if (requestedQty > 0 && alreadyBooked + requestedQty > rt.bilikTersedia) {
        return NextResponse.json(
          { error: `${rt.label} tidak mencukupi (baki ${Math.max(0, rt.bilikTersedia - alreadyBooked)} bilik) untuk tarikh ini` },
          { status: 409 }
        );
      }
    }
  } else {
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
  }

  let addonsTotal = 0;
  if (data.addonsJson) {
    try {
      const items = JSON.parse(data.addonsJson) as { price: number }[];
      addonsTotal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
    } catch {
      addonsTotal = 0;
    }
  }
  let facilityPrice = facility.costPerUse;
  if (data.asramaRoomsJson) {
    try {
      const rooms = JSON.parse(data.asramaRoomsJson) as { price: number }[];
      const roomsTotal = rooms.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
      if (roomsTotal > 0) facilityPrice = roomsTotal;
    } catch {
      // keep default facilityPrice
    }
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
      organisasi: data.organisasi,
      alamatOrganisasi: data.alamatOrganisasi,
      sebutNama: data.sebutNama,
      sebutTel: data.sebutTel,
      sebutEmel: data.sebutEmel,
      addonsJson: data.addonsJson,
      asramaRoomsJson: data.asramaRoomsJson,
      revenue: facilityPrice + addonsTotal,
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
