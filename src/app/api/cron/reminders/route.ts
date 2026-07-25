import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

/**
 * Sends H-1 WhatsApp reminders for confirmed bookings starting tomorrow.
 * No scheduler is wired up yet (no hosting/cron target agreed) — call this
 * route once a day (e.g. from an external cron or Windows Task Scheduler)
 * to trigger reminders.
 */
export async function POST() {
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "DISAHKAN",
      startDateTime: { gte: tomorrowStart, lte: tomorrowEnd },
    },
    include: { facility: true, user: true },
  });

  const existingReminders = await prisma.notification.findMany({
    where: { type: "REMINDER_H1", bookingId: { in: bookings.map((b) => b.id) } },
  });
  const alreadyRemindedIds = new Set(existingReminders.map((n) => n.bookingId));

  let sent = 0;
  for (const b of bookings) {
    if (alreadyRemindedIds.has(b.id)) continue;
    await sendWhatsAppNotification({
      userId: b.userId,
      bookingId: b.id,
      phone: b.user.phone,
      type: "REMINDER_H1",
      message: `Peringatan: tempahan anda untuk ${b.facility.name} bermula esok, ${b.startDateTime.toLocaleString("ms-MY")}.`,
    });
    sent++;
  }

  return NextResponse.json({ checked: bookings.length, sent });
}
