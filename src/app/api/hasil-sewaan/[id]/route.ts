import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function isStaff(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.tarikh !== undefined) {
    const tarikh = new Date(body.tarikh);
    if (isNaN(tarikh.getTime())) return NextResponse.json({ error: "Tarikh tidak sah" }, { status: 400 });
    data.tarikh = tarikh;
  }
  if (body.organisasi !== undefined) data.organisasi = String(body.organisasi).trim();
  if (body.lokasi !== undefined) data.lokasi = String(body.lokasi).trim();
  if (body.bilanganPeserta !== undefined) data.bilanganPeserta = Number(body.bilanganPeserta) || 0;
  if (body.hasilTerimaan !== undefined) data.hasilTerimaan = Number(body.hasilTerimaan) || 0;

  const record = await prisma.hasilSewaan.update({ where: { id }, data });
  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.hasilSewaan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
