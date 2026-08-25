import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { KOS_LOKASI_LABEL, KOS_JENIS_LABEL, KOS_KATEGORI_LABEL, REPAIR_TYPE_LABEL } from "@/lib/constants";

function canEdit(role: string) {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "TEKNIKAL";
}

function resolveEnum(value: unknown, labelMap: Record<string, string>): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (labelMap[raw]) return raw;
  const upper = raw.toUpperCase();
  if (labelMap[upper]) return upper;
  const match = Object.entries(labelMap).find(([, label]) => label.toLowerCase() === raw.toLowerCase());
  return match ? match[0] : null;
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
    const lokasi = resolveEnum(r["Lokasi"] ?? r.lokasi, KOS_LOKASI_LABEL);
    const perincianLokasi = String(r["Perincian Lokasi"] ?? r.perincianLokasi ?? "").trim() || null;
    const jenis = resolveEnum(r["Jenis"] ?? r.jenis, KOS_JENIS_LABEL);
    const butiranKerja = String(r["Butiran Kerja"] ?? r.butiranKerja ?? "").trim();
    const kos = Number(r["Kos (RM)"] ?? r.kos) || 0;
    const tugasDilaksanakan = resolveEnum(r["Tugas Dilaksanakan"] ?? r.tugasDilaksanakan, REPAIR_TYPE_LABEL);
    const kategori = resolveEnum(r["Kategori"] ?? r.kategori, KOS_KATEGORI_LABEL);

    if (!tarikh || isNaN(tarikh.getTime())) {
      errors.push({ row: i + 2, message: "Tarikh tidak sah" });
      continue;
    }
    if (!lokasi) {
      errors.push({ row: i + 2, message: "Lokasi tidak sah — sila guna nilai daripada templat" });
      continue;
    }
    if (!jenis) {
      errors.push({ row: i + 2, message: "Jenis tidak sah — sila guna nilai daripada templat" });
      continue;
    }
    if (!kategori) {
      errors.push({ row: i + 2, message: "Kategori tidak sah — sila guna nilai daripada templat" });
      continue;
    }
    if (!tugasDilaksanakan) {
      errors.push({ row: i + 2, message: "Tugas Dilaksanakan tidak sah — sila guna nilai daripada templat" });
      continue;
    }
    if (!butiranKerja) {
      errors.push({ row: i + 2, message: "Butiran Kerja diperlukan" });
      continue;
    }

    try {
      await prisma.kosPenyelenggaraan.create({
        data: { tarikh, lokasi, perincianLokasi, jenis, butiranKerja, kos, tugasDilaksanakan, kategori },
      });
      success++;
    } catch {
      errors.push({ row: i + 2, message: "Gagal simpan rekod" });
    }
  }

  return NextResponse.json({ success, errors });
}
