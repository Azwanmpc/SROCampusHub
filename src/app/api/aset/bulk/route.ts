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
    const namaAset = String(r["Nama Aset"] ?? r.namaAset ?? "").trim();
    const noPendaftaran = String(r["No. Pendaftaran"] ?? r.noPendaftaran ?? "").trim();
    const tahunRaw = r["Tahun"] ?? r.tahun;
    const tahun = tahunRaw !== undefined && tahunRaw !== "" ? String(tahunRaw).trim() : null;
    const lokasi = String(r["Lokasi"] ?? r.lokasi ?? "").trim();
    const statusRaw = String(r["Status"] ?? r.status ?? "").trim().toUpperCase();
    const status = statusRaw === "ROSAK" ? "ROSAK" : "BAIK";

    if (!namaAset || !lokasi) {
      errors.push({ row: i + 2, message: "Nama Aset dan Lokasi diperlukan" });
      continue;
    }

    try {
      await prisma.aset.create({ data: { namaAset, noPendaftaran, tahun, lokasi, status } });
      success++;
    } catch {
      errors.push({ row: i + 2, message: "Gagal simpan rekod" });
    }
  }

  return NextResponse.json({ success, errors });
}
