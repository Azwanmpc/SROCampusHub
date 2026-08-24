import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.password !== undefined) {
    if (typeof body.password !== "string" || body.password.length < 6) {
      return NextResponse.json({ error: "Kata laluan sekurang-kurangnya 6 aksara" }, { status: 400 });
    }
  }
  const passwordHash = body.password ? await hashPassword(body.password) : undefined;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
      ...(body.jawatan !== undefined ? { jawatan: body.jawatan?.trim() || null } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      jawatan: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const { id } = await params;

  if (id === session.userId) {
    return NextResponse.json({ error: "Anda tidak boleh memadam akaun sendiri" }, { status: 400 });
  }

  const [bookings, complaints, notifications, passwordResetTokens, pinjamanAset] = await Promise.all([
    prisma.booking.count({ where: { userId: id } }),
    prisma.complaint.count({ where: { userId: id } }),
    prisma.notification.count({ where: { userId: id } }),
    prisma.passwordResetToken.count({ where: { userId: id } }),
    prisma.pinjamanAset.count({ where: { pemohonId: id } }),
  ]);
  const hasHistory = bookings + complaints + notifications + passwordResetTokens + pinjamanAset > 0;
  if (hasHistory) {
    return NextResponse.json(
      { error: "Pengguna ini mempunyai rekod berkaitan (tempahan/aduan/pinjaman aset). Sila nyahaktifkan sahaja, bukan padam." },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
