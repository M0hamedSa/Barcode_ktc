import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ktc-default-secret-change-me",
);
const COOKIE_NAME = "ktc_session";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-status",
];
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

// Routes that require supervisor (or admin) role
const SUPERVISOR_ROUTES = ["/def"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (PUBLIC_API_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow static files & Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/logo") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Verify token
  let session: { userId: number; username: string; role: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      session = payload as unknown as {
        userId: number;
        username: string;
        role: string;
      };
    } catch {
      // Invalid token — treat as unauthenticated
    }
  }

  // If on a public route and already authenticated, redirect to home
  if (PUBLIC_ROUTES.some((r) => pathname === r) && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If not authenticated and not on a public route, redirect to login
  if (!session && !PUBLIC_ROUTES.some((r) => pathname === r)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route check
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Supervisor route check (admin also allowed)
  if (SUPERVISOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (
      !session ||
      (session.role !== "supervisor" && session.role !== "admin")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
