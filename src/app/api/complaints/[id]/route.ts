import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !["SUPERADMIN", "ADMIN", "TEKNIKAL"].includes(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const canApprove = session.role === "SUPERADMIN" || session.role === "ADMIN";
  const action = body.action as string | undefined;

  if (action === "AMBIL_DALAMAN" || action === "AMBIL_KONTRAKTOR") {
    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: "DALAM_TINDAKAN",
        repairType: action === "AMBIL_DALAMAN" ? "DALAMAN" : "KONTRAKTOR",
        ...(body.category !== undefined ? { category: body.category } : {}),
      },
      include: { facility: true, user: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "TANDAKAN_SIAP") {
    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: "MENUNGGU_PENGESAHAN" },
      include: { facility: true, user: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "SAHKAN_SIAP") {
    if (!canApprove) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: "SELESAI", resolvedAt: new Date() },
      include: { facility: true, user: true },
    });
    return NextResponse.json(updated);
  }

  if (action === "HANTAR_BALIK") {
    if (!canApprove) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    const updated = await prisma.complaint.update({
      where: { id },
      data: { status: "DALAM_TINDAKAN" },
      include: { facility: true, user: true },
    });
    return NextResponse.json(updated);
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.repairType !== undefined ? { repairType: body.repairType } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.staffNote !== undefined ? { staffNote: body.staffNote } : {}),
      ...(body.estimatedCost !== undefined ? { estimatedCost: Number(body.estimatedCost) } : {}),
      ...(body.status === "SELESAI" ? { resolvedAt: new Date() } : {}),
    },
    include: { facility: true, user: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const { id } = await params;
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) return NextResponse.json({ error: "Aduan tidak dijumpai" }, { status: 404 });

  const isOwner = complaint.userId === session.userId;
  const isStaff = ["SUPERADMIN", "ADMIN"].includes(session.role);
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  await prisma.complaint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
