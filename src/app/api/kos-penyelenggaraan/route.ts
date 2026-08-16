import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function canView(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "TEKNIKAL" || role === "STAFF_MPC";
}
function canEdit(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "TEKNIKAL";
}

export async function GET() {
  const session = await getSession();
  if (!session || !canView(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const records = await prisma.kosPenyelenggaraan.findMany({ orderBy: { tarikh: "desc" } });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canEdit(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await req.json();
  const tarikh = body.tarikh ? new Date(body.tarikh) : null;
  const lokasi = String(body.lokasi || "").trim();
  const perincianLokasi = body.perincianLokasi ? String(body.perincianLokasi).trim() : null;
  const jenis = String(body.jenis || "").trim();
  const butiranKerja = String(body.butiranKerja || "").trim();
  const kos = Number(body.kos) || 0;
  const tugasDilaksanakan = String(body.tugasDilaksanakan || "").trim();
  const kategori = String(body.kategori || "").trim();

  if (!tarikh || isNaN(tarikh.getTime()) || !lokasi || !jenis || !butiranKerja || !tugasDilaksanakan || !kategori) {
    return NextResponse.json({ error: "Sila lengkapkan medan yang diperlukan" }, { status: 400 });
  }

  const record = await prisma.kosPenyelenggaraan.create({
    data: { tarikh, lokasi, perincianLokasi, jenis, butiranKerja, kos, tugasDilaksanakan, kategori },
  });

  return NextResponse.json(record);
}
