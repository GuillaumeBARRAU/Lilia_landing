import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin/stats") || pathname.startsWith("/api/admin/export");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const session = req.cookies.get("admin_session")?.value;

  if (session === "ok") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/stats", "/api/admin/export"],
};