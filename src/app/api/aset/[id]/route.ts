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

  const data: Record<string, unknown> = {};
  if (body.namaAset !== undefined) data.namaAset = String(body.namaAset).trim();
  if (body.noPendaftaran !== undefined) data.noPendaftaran = String(body.noPendaftaran).trim();
  if (body.tahun !== undefined) data.tahun = body.tahun ? String(body.tahun).trim() : null;
  if (body.lokasi !== undefined) data.lokasi = String(body.lokasi).trim();
  if (body.status !== undefined) data.status = body.status === "ROSAK" ? "ROSAK" : "BAIK";

  const record = await prisma.aset.update({ where: { id }, data });
  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !canEdit(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.aset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
