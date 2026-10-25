import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const dashboardFor = (role?: string) =>
  role === "ADMIN"
    ? "/dashboard/admin"
    : role === "MENTOR"
      ? "/dashboard/mentor"
      : "/dashboard/student";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  // Logged-in users shouldn't see login/register
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(dashboardFor(role), req.nextUrl));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const url = new URL("/login", req.nextUrl);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    // Role guards
    if (pathname.startsWith("/dashboard/student") && role !== "STUDENT")
      return NextResponse.redirect(new URL(dashboardFor(role), req.nextUrl));
    if (pathname.startsWith("/dashboard/mentor") && role !== "MENTOR")
      return NextResponse.redirect(new URL(dashboardFor(role), req.nextUrl));
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN")
      return NextResponse.redirect(new URL(dashboardFor(role), req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
