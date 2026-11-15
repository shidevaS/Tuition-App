import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};

const ALG = "HS256";
const SESSION_COOKIE = "tzn_session";

/** Routes reachable without a session. */
const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);
const PUBLIC_API_ROUTES = new Set(["/api/auth/login", "/api/auth/register", "/api/auth/logout"]);

/** Routes that require an admin session. */
const ADMIN_PREFIX = "/admin";

/** Only Shivani Sharma and Devendra Sharma are admins. */
const ADMIN_EMAILS = new Set(["shivani@tuiton.app", "devendra@tuiton.app"]);

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

function sessionOf(req: NextRequest): Promise<JWTPayload | null> {
  const authorization = req.headers.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearerToken ?? req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return Promise.resolve(null);
  return jwtVerify(token, secretKey(), { algorithms: [ALG] })
    .then(({ payload }) => payload)
    .catch(() => null);
}

function isAdmin(session: JWTPayload | null): boolean {
  return Boolean(session?.email && ADMIN_EMAILS.has(session.email as string));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await sessionOf(req);
  const authed = Boolean(session?.sub);

  const isApiRoute = pathname.startsWith("/api/");
  const needsAuth = isApiRoute
    ? !PUBLIC_API_ROUTES.has(pathname)
    : !PUBLIC_ROUTES.has(pathname) && !pathname.startsWith(ADMIN_PREFIX);
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith("/api/admin/");

  // Protected area, no session → go log in (preserve the intended destination).
  if (!authed && (needsAuth || needsAdmin)) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Admin area: only Shivani & Devendra can access. Other ADMIN-role users are redirected.
  if (authed && needsAdmin && !isAdmin(session)) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Already signed in, hitting a public auth page → go to their home.
  if (authed && (pathname === "/login" || pathname === "/register")) {
    const url = req.nextUrl.clone();
    url.pathname = isAdmin(session) ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}