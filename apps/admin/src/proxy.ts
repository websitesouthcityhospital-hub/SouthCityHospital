import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SESSION_COOKIE = "sch_admin_session";
const SECRET_KEY = process.env.JWT_SECRET_KEY || "super-secret-default-key-for-dev";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    const role = payload.role as string;
    const pathname = request.nextUrl.pathname;

    // Staff cannot access admin-only routes
    if (role !== "admin") {
      const adminOnlyPaths = ["/dashboard", "/doctors", "/schedules", "/patients", "/staff"];
      if (adminOnlyPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL("/bookings", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctors/:path*",
    "/schedules/:path*",
    "/patients/:path*",
    "/staff/:path*",
    "/bookings/:path*"
  ],
};
