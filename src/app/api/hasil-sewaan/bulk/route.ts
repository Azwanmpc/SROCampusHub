import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function canEdit(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canEdit(session.role)) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await req.json();
  const rows = Array.isArray(body.rows) ? body.rows : [];

  let success = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const tarikhRaw = r["Tarikh"] ?? r.tarikh;
    const tarikh = tarikhRaw ? new Date(tarikhRaw) : null;
    const organisasi = String(r["Organisasi"] ?? r.organisasi ?? "").trim();
    const lokasi = String(r["Lokasi"] ?? r.lokasi ?? "").trim().toUpperCase();
    const bilanganPeserta = Number(r["Bilangan Peserta"] ?? r.bilanganPeserta) || 0;
    const hasilTerimaan = Number(r["Hasil Terimaan (RM)"] ?? r.hasilTerimaan) || 0;

    if (!tarikh || isNaN(tarikh.getTime()) || !organisasi || !lokasi) {
      errors.push({ row: i + 2, message: "Tarikh, Organisasi dan Lokasi diperlukan" });
      continue;
    }

    try {
      await prisma.hasilSewaan.create({ data: { tarikh, organisasi, lokasi, bilanganPeserta, hasilTerimaan } });
      success++;
    } catch {
      errors.push({ row: i + 2, message: "Gagal simpan rekod" });
    }
  }

  return NextResponse.json({ success, errors });
}
