import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function canEdit(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEdit(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const rate = Number(body.rate);
  if (!Number.isFinite(rate) || rate < 0) {
    return NextResponse.json({ error: "Kadar tidak sah" }, { status: 400 });
  }

  const record = await prisma.asramaRoomType.update({ where: { id }, data: { rate } });
  return NextResponse.json(record);
}
