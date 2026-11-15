import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/config/navigation";

/**
 * Session cookie names commonly set by Laravel Sanctum SPA.
 * Per Doc 04 §6: "Middleware may only check that a session cookie exists,
 * to avoid flashing protected pages. It is a convenience, never a security control."
 */
const SESSION_COOKIE_INDICATORS = [
  "korak-api-session",
  "korak_session",
  "laravel_session",
  "session",
  "xsrf-token",
];

export function hasSessionCookie(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  return cookies.some((c) => {
    const lower = c.name.toLowerCase();
    return (
      SESSION_COOKIE_INDICATORS.some((indicator) => lower.includes(indicator)) ||
      lower.endsWith("_session")
    );
  });
}

/**
 * Validates that an intended redirect path is local and non-malicious (prevents open-redirects).
 */
export function isSafeRedirectPath(path: string | null): boolean {
  if (!path) return false;
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    !path.includes(":")
  );
}

/**
 * Public guest routes accessible to all visitors (landing & legal pages).
 * Per Doc 09 §14, guest pages are public and indexable.
 */
export const PUBLIC_GUEST_ROUTES = [
  ROUTES.HOME,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
] as const;

/**
 * List of public authentication routes that unauthenticated users can access.
 */
export const PUBLIC_AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_DEVICE,
  ROUTES.SESSION_EXPIRED,
] as const;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Check if the current route is a public guest route
  const isGuestRoute =
    pathname === ROUTES.HOME ||
    pathname === ROUTES.PRIVACY ||
    pathname.startsWith(`${ROUTES.PRIVACY}/`) ||
    pathname === ROUTES.TERMS ||
    pathname.startsWith(`${ROUTES.TERMS}/`);

  if (isGuestRoute) {
    return NextResponse.next();
  }

  // 2. Check if the current route is a public auth route
  const isPublicAuthRoute =
    PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/auth/");

  if (isPublicAuthRoute) {
    return NextResponse.next();
  }

  // 3. Protected route check: if not a public route and no session cookie exists
  const hasSession = hasSessionCookie(request);

  if (!hasSession) {
    const fullPath = `${pathname}${search}`;
    const intended = isSafeRedirectPath(fullPath) ? fullPath : ROUTES.OVERVIEW;
    const redirectUrl = new URL(ROUTES.LOGIN, request.url);
    redirectUrl.searchParams.set("intended", intended);

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

/**
 * Matcher configuration. Excludes Next.js internals, API routes, static assets,
 * and favicon from middleware execution.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files (*.svg, *.png, *.jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
