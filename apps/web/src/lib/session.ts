import { cookies, headers } from "next/headers";
import type { SessionUser } from "@tuiton/shared";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./jwt";

/** Only Shivani Sharma and Devendra Sharma are admins. */
export const ADMIN_EMAILS = new Set(["shivani@tuiton.app", "devendra@tuiton.app"]);

/** Write a signed session cookie for the given actor. */
export async function createSession(actor: Omit<SessionUser, "iat" | "exp">): Promise<string> {
  const token = await signSession(actor);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return token;
}

/** Read and verify the current request's session cookie, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const authorization = headers().get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearerToken ?? cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Clear the session cookie (logout). */
export async function destroySession(): Promise<void> {
  cookies().set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

/** Check whether a session belongs to one of the designated admins. */
export function isAdmin(session: SessionUser | null): boolean {
  return Boolean(session?.email && ADMIN_EMAILS.has(session.email));
}

function cookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: prod,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
