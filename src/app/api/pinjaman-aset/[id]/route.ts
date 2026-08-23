import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";

function isStaff(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const action = body.action as string | undefined;

  const existing = await prisma.pinjamanAset.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: "Permohonan tidak dijumpai" }, { status: 404 });

  if (action === "LULUSKAN" || action === "TOLAK") {
    if (!isStaff(session.role)) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    if (existing.status !== "MENUNGGU_KELULUSAN") {
      return NextResponse.json({ error: "Permohonan ini telah diproses" }, { status: 409 });
    }

    if (action === "TOLAK") {
      const updated = await prisma.pinjamanAset.update({
        where: { id },
        data: { status: "DITOLAK", rejectionReason: body.rejectionReason ?? null, tarikhDitolak: new Date() },
        include: { pemohon: { select: { id: true, name: true } }, items: { include: { aset: true } } },
      });
      return NextResponse.json(updated);
    }

    const now = new Date();
    const [updated] = await prisma.$transaction([
      prisma.pinjamanAset.update({
        where: { id },
        data: {
          status: "DILULUSKAN",
          tarikhLulus: now,
          tarikhDipinjam: now,
          pelulusNama: session.name,
          pelulusJawatan: ROLE_LABEL[session.role] ?? session.role,
        },
        include: { pemohon: { select: { id: true, name: true } }, items: { include: { aset: true } } },
      }),
      prisma.aset.updateMany({
        where: { id: { in: existing.items.map((it) => it.asetId) } },
        data: { sedangDipinjam: true },
      }),
    ]);
    return NextResponse.json(updated);
  }

  if (action === "TANDA_DIPULANGKAN") {
    if (existing.pemohonId !== session.userId) {
      return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    }
    if (existing.status !== "DILULUSKAN") {
      return NextResponse.json({ error: "Permohonan ini belum diluluskan atau telah dipulangkan" }, { status: 409 });
    }
    const updated = await prisma.pinjamanAset.update({
      where: { id },
      data: {
        status: "DIPULANGKAN",
        tarikhDipulangkan: new Date(),
        pemulangNama: session.name,
        pemulangJawatan: ROLE_LABEL[session.role] ?? session.role,
      },
      include: { pemohon: { select: { id: true, name: true } }, items: { include: { aset: true } } },
    });
    return NextResponse.json(updated);
  }

  if (action === "SAHKAN_TERIMA") {
    if (!isStaff(session.role)) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    if (existing.status !== "DIPULANGKAN") {
      return NextResponse.json({ error: "Aset ini belum ditandakan dipulangkan oleh peminjam" }, { status: 409 });
    }
    const [updated] = await prisma.$transaction([
      prisma.pinjamanAset.update({
        where: { id },
        data: {
          status: "SELESAI",
          tarikhDiterima: new Date(),
          penerimaNama: session.name,
          penerimaJawatan: ROLE_LABEL[session.role] ?? session.role,
        },
        include: { pemohon: { select: { id: true, name: true } }, items: { include: { aset: true } } },
      }),
      prisma.aset.updateMany({
        where: { id: { in: existing.items.map((it) => it.asetId) } },
        data: { sedangDipinjam: false },
      }),
    ]);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Tindakan tidak sah" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.pinjamanAset.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Permohonan tidak dijumpai" }, { status: 404 });

  const isOwner = existing.pemohonId === session.userId;
  if (!isOwner && !isStaff(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  if (existing.status !== "MENUNGGU_KELULUSAN" && !isStaff(session.role)) {
    return NextResponse.json({ error: "Permohonan yang telah diluluskan tidak boleh dipadam" }, { status: 409 });
  }

  await prisma.pinjamanAset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
