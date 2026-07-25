import { prisma } from "./prisma";

const WASENDER_API_URL = process.env.WASENDER_API_URL;
const WASENDER_API_KEY = process.env.WASENDER_API_KEY;

type NotifyArgs = {
  userId: string;
  bookingId?: string;
  phone?: string | null;
  type: string;
  message: string;
};

/**
 * Sends a one-way WhatsApp notification via WaSenderAPI, logging every attempt.
 * When WASENDER_API_URL/KEY are not configured (no real account yet), the message
 * is only logged to the Notification table so the rest of the app works unaffected.
 */
export async function sendWhatsAppNotification({
  userId,
  bookingId,
  phone,
  type,
  message,
}: NotifyArgs) {
  const notification = await prisma.notification.create({
    data: { userId, bookingId, type, message, channel: "whatsapp", sent: false },
  });

  if (!WASENDER_API_URL || !WASENDER_API_KEY || !phone) {
    return notification;
  }

  try {
    const res = await fetch(WASENDER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WASENDER_API_KEY}`,
      },
      body: JSON.stringify({ to: phone, text: message }),
    });

    if (res.ok) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { sent: true, sentAt: new Date() },
      });
    }
  } catch {
    // Keep the logged (unsent) notification; delivery can be retried later.
  }

  return notification;
}
