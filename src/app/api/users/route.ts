import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const body = await req.json();
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: body.email }, { username: body.username }] },
  });
  if (existing) {
    return NextResponse.json({ error: "Email atau username sudah digunakan" }, { status: 409 });
  }
  const passwordHash = await hashPassword(body.password || "password123");
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      username: body.username,
      phone: body.phone ?? "",
      passwordHash,
      role: body.role ?? "PEMOHON",
    },
  });
  return NextResponse.json(user);
}
