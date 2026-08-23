import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(facilities);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }
  const body = await req.json();
  const facility = await prisma.facility.create({
    data: {
      name: body.name,
      type: body.type,
      capacity: Number(body.capacity),
      description: body.description ?? "",
      costPerUse: Number(body.costPerUse ?? 0),
      status: body.status ?? "TERSEDIA",
      imageUrl: body.imageUrl ?? null,
    },
  });
  return NextResponse.json(facility);
}
