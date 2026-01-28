import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { Role } from "@/lib/types"; // We might need to ensure this exists or use string literal

// Define payload type based on what NestJS sends
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // 1. Check if token exists for protected routes
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded.role;
      const pathname = request.nextUrl.pathname;

      // 2. Role-based redirection logic

      // Teacher routes
      if (pathname.startsWith("/dashboard/teacher") && role !== Role.TEACHER) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Admin routes
      if (pathname.startsWith("/dashboard/admin") && role !== Role.ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Learner routes
      if (
        pathname.startsWith("/dashboard/apprenant") &&
        role !== Role.STUDENT
      ) {
        // Teachers might be allowed to view learner view? For now strict separation.
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/dashboard/:path*",
};
