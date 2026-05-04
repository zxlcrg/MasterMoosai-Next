import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isTeacherPage = nextUrl.pathname.startsWith("/teacher");
  const isStudentPage = nextUrl.pathname.startsWith("/student");

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    const target = role === "ADMIN" ? "/admin/dashboard" : role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
    return NextResponse.redirect(new URL(target, nextUrl));
  }

  // Protect role-specific routes
  if (!isLoggedIn && (isAdminPage || isTeacherPage || isStudentPage)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn) {
    if (isAdminPage && role !== "ADMIN") return NextResponse.redirect(new URL("/", nextUrl));
    if (isTeacherPage && role !== "TEACHER") return NextResponse.redirect(new URL("/", nextUrl));
    if (isStudentPage && role !== "STUDENT") return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
