import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isPaymentsRoute = req.nextUrl.pathname.startsWith("/payments");

    if (isAdminRoute && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    // Payment & Attendance is a founder-only area for teacher accounts —
    // a regular teacher only manages homework for their own students.
    if (isPaymentsRoute && token?.role === "TEACHER" && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/syllabus/:path*",
    "/homework/:path*",
    "/vocabulary/:path*",
    "/payments/:path*",
    "/teachers/:path*",
    "/admin/:path*",
  ],
};
