import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * No SMTP/email service is configured yet, so the reset link cannot actually
 * be delivered. The token is still generated and stored so email sending can
 * be wired in later without changing this contract. Always responds success
 * regardless of whether the email exists, to avoid leaking registered emails.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || "").toLowerCase().trim();

  const user = await prisma.user.findFirst({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
  }

  return NextResponse.json({ ok: true });
}
