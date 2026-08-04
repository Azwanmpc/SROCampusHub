import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getSession();

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Tiada fail dimuat naik" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Hanya fail imej dibenarkan" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Saiz fail melebihi 8MB" }, { status: 400 });
  }

  const ALLOWED_FOLDERS = ["complaints", "facilities"];
  const requestedFolder = String(form.get("folder") ?? "complaints");
  const folder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : "complaints";

  if (folder === "facilities" && (!session || (session.role !== "SUPERADMIN" && session.role !== "ADMIN"))) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-zA-Z0-9]/g, "");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/api/uploads/${folder}/${filename}` });
}
