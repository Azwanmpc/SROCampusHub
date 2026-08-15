import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function isStaff(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "STAFF_MPC";
}

export async function GET() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const records = await prisma.hasilSewaan.findMany({ orderBy: { tarikh: "desc" } });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await req.json();
  const tarikh = body.tarikh ? new Date(body.tarikh) : null;
  const organisasi = String(body.organisasi || "").trim();
  const lokasi = String(body.lokasi || "").trim();
  const bilanganPeserta = Number(body.bilanganPeserta) || 0;
  const hasilTerimaan = Number(body.hasilTerimaan) || 0;

  if (!tarikh || isNaN(tarikh.getTime()) || !organisasi || !lokasi) {
    return NextResponse.json({ error: "Tarikh, organisasi dan lokasi diperlukan" }, { status: 400 });
  }

  const record = await prisma.hasilSewaan.create({
    data: { tarikh, organisasi, lokasi, bilanganPeserta, hasilTerimaan },
  });

  return NextResponse.json(record);
}
