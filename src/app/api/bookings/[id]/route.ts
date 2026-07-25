import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const isStaff = session.role === "SUPERADMIN" || session.role === "ADMIN";

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { facility: true, user: true },
  });
  if (!booking) return NextResponse.json({ error: "Tempahan tidak dijumpai" }, { status: 404 });

  const action = body.action as string;

  if (action === "APPROVE" || action === "REJECT") {
    if (!isStaff) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });

    const status = action === "APPROVE" ? "DISAHKAN" : "DITOLAK";
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        rejectionReason: action === "REJECT" ? body.rejectionReason ?? "Tiada sebab dinyatakan" : null,
      },
      include: { facility: true, user: true },
    });

    await sendWhatsAppNotification({
      userId: booking.userId,
      bookingId: booking.id,
      phone: booking.user.phone,
      type: action === "APPROVE" ? "TEMPAHAN_DISAHKAN" : "TEMPAHAN_DITOLAK",
      message:
        action === "APPROVE"
          ? `Tempahan anda untuk ${booking.facility.name} telah DISAHKAN oleh admin.`
          : `Tempahan anda untuk ${booking.facility.name} telah DITOLAK. Sebab: ${body.rejectionReason ?? "Tiada sebab dinyatakan"}`,
    });

    return NextResponse.json(updated);
  }

  if (action === "CANCEL") {
    if (!isStaff && booking.userId !== session.userId) {
      return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    }
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "DIBATALKAN" },
    });
    return NextResponse.json(updated);
  }

  if (action === "CHECK_IN") {
    if (!isStaff) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    const updated = await prisma.booking.update({
      where: { id },
      data: { checkInAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  if (action === "CHECK_OUT") {
    if (!isStaff) return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
    const updated = await prisma.booking.update({
      where: { id },
      data: { checkOutAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Tindakan tidak sah" }, { status: 400 });
}
