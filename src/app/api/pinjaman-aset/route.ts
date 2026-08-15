import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { pinjamanAsetSchema } from "@/lib/validation";

function isStaff(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export async function GET() {
  const session = await getSession();
  if (!session || !["SUPERADMIN", "ADMIN", "PEMINJAM", "STAFF_MPC"].includes(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const records = await prisma.pinjamanAset.findMany({
    where: isStaff(session.role) ? {} : { pemohonId: session.userId },
    include: {
      pemohon: { select: { id: true, name: true } },
      items: { include: { aset: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "PEMINJAM" && session.role !== "STAFF_MPC")) {
    return NextResponse.json({ error: "Hanya peminjam boleh membuat permohonan" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = pinjamanAsetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak sah" }, { status: 400 });
  }
  const data = parsed.data;

  const assets = await prisma.aset.findMany({ where: { id: { in: data.asetIds } } });
  if (assets.length !== data.asetIds.length) {
    return NextResponse.json({ error: "Sebahagian aset tidak dijumpai" }, { status: 404 });
  }
  const alreadyOut = assets.filter((a) => a.sedangDipinjam);
  if (alreadyOut.length > 0) {
    return NextResponse.json(
      { error: `${alreadyOut.map((a) => a.namaAset).join(", ")} sedang dipinjam dan tidak tersedia` },
      { status: 409 }
    );
  }

  const record = await prisma.pinjamanAset.create({
    data: {
      pemohonId: session.userId,
      jawatan: data.jawatan,
      bahagian: data.bahagian,
      tujuan: data.tujuan,
      tempatDigunakan: data.tempatDigunakan,
      tarikhDijangkaPulang: new Date(data.tarikhDijangkaPulang),
      items: { create: data.asetIds.map((asetId) => ({ asetId })) },
    },
    include: { pemohon: { select: { id: true, name: true } }, items: { include: { aset: true } } },
  });

  return NextResponse.json(record);
}
