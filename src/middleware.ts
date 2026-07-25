import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "sro-campushub-dev-secret-change-in-production"
);
const COOKIE_NAME = "sro_session";

const PUBLIC_PATHS = ["/login", "/register"];

const ROLE_HOME: Record<string, string> = {
  SUPERADMIN: "/dashboard",
  ADMIN: "/dashboard",
  PEMOHON: "/dashboard",
  PENGADU: "/dashboard",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/facilities-img") ||
    /\.(png|jpg|jpeg|svg|ico|webp)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let session: { userId: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      session = payload as unknown as { userId: string; role: string };
    } catch {
      session = null;
    }
  }

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname === "/";

  if (!session && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_HOME[session.role] ?? "/dashboard";
    return NextResponse.redirect(url);
  }

  if (session && pathname.startsWith("/tetapan") && session.role !== "SUPERADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    session &&
    (pathname.startsWith("/kelulusan") || pathname.startsWith("/prestasi") || pathname.startsWith("/laporan")) &&
    session.role !== "SUPERADMIN" &&
    session.role !== "ADMIN"
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
