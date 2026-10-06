import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC = ["/login", "/sign-up", "/api/auth"];

/**
 * Cheap cookie check so signed-out visitors never see an app shell flash.
 * Real authorisation happens in server components and actions (src/lib/tenant.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasSession && !isPublic && pathname !== "/") {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (hasSession && (pathname === "/login" || pathname === "/sign-up" || pathname === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"],
};
