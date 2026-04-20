import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect /student and /faculty routes
  if (pathname.startsWith("/student") || pathname.startsWith("/faculty")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based access control
    if (pathname.startsWith("/student") && payload.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/faculty/dashboard", request.url));
    }

    if (pathname.startsWith("/faculty") && payload.role !== "FACULTY") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  // Redirect authenticated users away from login
  if (pathname === "/login" && token) {
    const payload = await verifyToken(token);
    if (payload) {
      if (payload.role === "STUDENT") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/faculty/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/faculty/:path*", "/login"],
};
