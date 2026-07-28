import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

// Next.js snapshots the `public/` directory at server boot in production, so files
// written there at runtime (uploads) 404 until the next restart/deploy. Serving them
// through a route handler instead means every request reads the filesystem fresh.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (segments.length === 0 || segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Laluan tidak sah" }, { status: 400 });
  }

  const ext = path.extname(segments[segments.length - 1]).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Jenis fail tidak disokong" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", ...segments);
  try {
    const data = await readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fail tidak dijumpai" }, { status: 404 });
  }
}
