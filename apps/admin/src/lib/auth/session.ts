import { cookies } from "next/headers";
import type { AuthSession, UserRole } from "@sch/types";

const ADMIN_SESSION_COOKIE = "sch_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 60 minutes session

export async function setSessionCookie(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getSessionUser(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: AuthSession = JSON.parse(sessionCookie.value);
    const expiresAt = new Date(session.expiresAt).getTime();
    if (Date.now() > expiresAt) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AuthSession> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return user;
}

export async function requireStaffOrAdmin(): Promise<AuthSession> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
