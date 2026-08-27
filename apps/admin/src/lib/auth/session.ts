import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { AuthSession } from "@sch/types";

const ADMIN_SESSION_COOKIE = "sch_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 60 minutes session
const SECRET_KEY = process.env.JWT_SECRET_KEY || "super-secret-default-key-for-dev";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function setSessionCookie(session: AuthSession): Promise<void> {
  const cookieStore = await cookies();
  
  const token = await new SignJWT(session as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(encodedKey);

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
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
    const { payload } = await jwtVerify(sessionCookie.value, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AuthSession;
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
