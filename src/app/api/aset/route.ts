import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function isStaff(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "STAFF_MPC";
}

export async function GET() {
  const session = await getSession();
  // Read-only access is also open to PEMINJAM so they can search the
  // inventory when filling a loan request; write endpoints below stay
  // staff-only.
  if (!session || !(isStaff(session.role) || session.role === "PEMINJAM")) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const records = await prisma.aset.findMany({ orderBy: [{ lokasi: "asc" }, { namaAset: "asc" }] });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await req.json();
  const namaAset = String(body.namaAset || "").trim();
  const noPendaftaran = String(body.noPendaftaran || "").trim();
  const tahun = body.tahun ? String(body.tahun).trim() : null;
  const lokasi = String(body.lokasi || "").trim();
  const status = body.status === "ROSAK" ? "ROSAK" : "BAIK";

  if (!namaAset || !lokasi) {
    return NextResponse.json({ error: "Nama aset dan lokasi diperlukan" }, { status: 400 });
  }

  const record = await prisma.aset.create({
    data: { namaAset, noPendaftaran, tahun, lokasi, status },
  });

  return NextResponse.json(record);
}
