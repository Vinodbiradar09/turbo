import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);
  if (
    session &&
    (pathname === "/login" || pathname === "/signup" || pathname === "/")
  ) {
    console.log("i am hitting this");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/privacy" ||
    pathname === "/about" ||
    pathname === "/blog" ||
    pathname === "/careers" ||
    pathname === "/contact" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/v1");

  if (isPublic) {
    return NextResponse.next();
  }
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  if (
    session &&
    (pathname === "/login" || pathname === "/signup" || pathname === "/")
  ) {
    console.log("i am hitting this");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
