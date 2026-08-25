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
  const half = Number(body.half);
  const full = Number(body.full);
  if (!Number.isFinite(half) || half < 0 || !Number.isFinite(full) || full < 0) {
    return NextResponse.json({ error: "Harga tidak sah" }, { status: 400 });
  }

  const record = await prisma.equipmentAddon.update({ where: { id }, data: { half, full } });
  return NextResponse.json({ ...record, appliesTo: JSON.parse(record.appliesTo) });
}
