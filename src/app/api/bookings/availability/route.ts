import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ASRAMA_ROOM_TYPES } from "@/lib/facilityRates";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!facilityId || !start || !end) {
    return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const overlapping = await prisma.booking.findMany({
    where: {
      facilityId,
      status: { in: ["MENUNGGU", "DISAHKAN"] },
      startDateTime: { lt: endDate },
      endDateTime: { gt: startDate },
    },
    select: { asramaRoomsJson: true },
  });

  const booked: Record<string, number> = {};
  for (const b of overlapping) {
    if (!b.asramaRoomsJson) continue;
    try {
      const rooms = JSON.parse(b.asramaRoomsJson) as { key: string; qty: number }[];
      for (const r of rooms) {
        booked[r.key] = (booked[r.key] ?? 0) + r.qty;
      }
    } catch {
      // ignore malformed data
    }
  }

  const availability = Object.fromEntries(
    ASRAMA_ROOM_TYPES.map((rt) => [rt.key, Math.max(0, rt.bilikTersedia - (booked[rt.key] ?? 0))])
  );

  return NextResponse.json(availability);
}
