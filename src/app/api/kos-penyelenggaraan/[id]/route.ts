import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function canEdit(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "TEKNIKAL";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEdit(session.role)) {
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
  if (body.lokasi !== undefined) data.lokasi = String(body.lokasi).trim();
  if (body.perincianLokasi !== undefined) data.perincianLokasi = body.perincianLokasi ? String(body.perincianLokasi).trim() : null;
  if (body.jenis !== undefined) data.jenis = String(body.jenis).trim();
  if (body.butiranKerja !== undefined) data.butiranKerja = String(body.butiranKerja).trim();
  if (body.kos !== undefined) data.kos = Number(body.kos) || 0;
  if (body.tugasDilaksanakan !== undefined) data.tugasDilaksanakan = String(body.tugasDilaksanakan).trim();
  if (body.kategori !== undefined) data.kategori = String(body.kategori).trim();

  const record = await prisma.kosPenyelenggaraan.update({ where: { id }, data });
  return NextResponse.json(record);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEdit(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.kosPenyelenggaraan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
