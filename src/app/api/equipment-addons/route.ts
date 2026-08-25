import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Tiada sesi" }, { status: 401 });
  }
  const records = await prisma.equipmentAddon.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(records.map((r) => ({ ...r, appliesTo: JSON.parse(r.appliesTo) })));
}
