import { cookies } from "next/headers";
import type { UserRole, StaffAccount } from "@sch/types";

const SESSION_COOKIE_NAME = "sch_admin_session";
const SESSION_MAX_AGE = 60 * 60; // 60 minutes (idle timeout)

export interface SessionPayload {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  issuedAt: number;
}

const SEED_STAFF_ACCOUNTS: StaffAccount[] = [];

export async function setSessionCookie(payload: Omit<SessionPayload, "issuedAt">): Promise<void> {
  const cookieStore = await cookies();
  const sessionData: SessionPayload = {
    ...payload,
    issuedAt: Date.now(),
  };

  const encoded = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const decoded = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const payload = JSON.parse(decoded) as SessionPayload;

    // Check expiry
    const now = Date.now();
    if (now - payload.issuedAt > SESSION_MAX_AGE * 1000) {
      return null;
    }

    // Verify account is active
    if (!payload.isActive) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Server-side guard: Requires Admin role. Returns user or throws 403 error.
 */
export async function requireAdmin(): Promise<SessionPayload> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN_ADMIN_ONLY");
  }
  return user;
}

/**
 * Server-side guard: Requires Staff or Admin role.
 */
export async function requireStaffOrAdmin(): Promise<SessionPayload> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function getSeedStaffAccounts(): StaffAccount[] {
  return SEED_STAFF_ACCOUNTS;
}
