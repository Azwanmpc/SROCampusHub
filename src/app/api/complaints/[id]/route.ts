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

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.repairType !== undefined ? { repairType: body.repairType } : {}),
      ...(body.status === "SELESAI" ? { resolvedAt: new Date() } : {}),
    },
    include: { facility: true, user: true },
  });

  return NextResponse.json(updated);
}
