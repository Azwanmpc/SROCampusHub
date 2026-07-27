import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { complaintSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const isStaff = ["SUPERADMIN", "ADMIN", "TEKNIKAL"].includes(session.role);
  const complaints = await prisma.complaint.findMany({
    where: isStaff ? {} : { userId: session.userId },
    include: { facility: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(complaints);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const body = await req.json();
  const parsed = complaintSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak sah" }, { status: 400 });
  }

  const complaint = await prisma.complaint.create({
    data: {
      facilityId: parsed.data.facilityId || null,
      userId: session.userId,
      location: parsed.data.location,
      description: parsed.data.description,
      priority: parsed.data.priority,
      photoUrl: body.photoUrl || null,
    },
    include: { facility: true, user: true },
  });

  return NextResponse.json(complaint);
}
