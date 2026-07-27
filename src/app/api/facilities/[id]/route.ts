import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const facility = await prisma.facility.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.capacity !== undefined ? { capacity: Number(body.capacity) } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.costPerUse !== undefined ? { costPerUse: Number(body.costPerUse) } : {}),
      ...(body.halfDayRate !== undefined ? { halfDayRate: body.halfDayRate === null ? null : Number(body.halfDayRate) } : {}),
      ...(body.fullDayRate !== undefined ? { fullDayRate: body.fullDayRate === null ? null : Number(body.fullDayRate) } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
    },
  });
  return NextResponse.json(facility);
}
