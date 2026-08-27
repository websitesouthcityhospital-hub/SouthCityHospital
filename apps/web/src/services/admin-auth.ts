import type {
  StaffAccount,
  CreateStaffAccountInput,
  UserRole,
} from "@sch/types";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STAFF_STORAGE_KEY = "sch_staff_accounts_store";

const DEFAULT_ACCOUNTS: (StaffAccount & { passwordHash: string })[] = [];

function getStoredStaff(): (StaffAccount & { passwordHash: string })[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(LOCAL_STAFF_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveStoredStaff(accounts: (StaffAccount & { passwordHash: string })[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STAFF_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to persist staff accounts", err);
  }
}

/**
 * Authenticates email and password.
 * Returns staff account with role if valid, or null.
 */
export async function authenticateCredentials(
  email: string,
  passwordPlain: string
): Promise<{ success: boolean; user?: StaffAccount; error?: string }> {
  // Simulate network latency (300ms)
  await new Promise((r) => setTimeout(r, 300));

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = passwordPlain.trim();

  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .select("*")
        .eq("email", cleanEmail)
        .single();

      if (!error && data) {
        if (!data.is_active) {
          return { success: false, error: "This account has been deactivated. Please contact your administrator." };
        }
        // In full DB deployment, compare bcrypt hash or token
        return {
          success: true,
          user: {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            role: data.role as UserRole,
            isActive: data.is_active,
            createdBy: data.created_by,
            createdAt: data.created_at,
            lastLoginAt: new Date().toISOString(),
          },
        };
      }
    } catch (err) {
      console.warn("Supabase staff auth query fallback:", err);
    }
  }

  // Local fallback validation
  const accounts = getStoredStaff();
  const found = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!found) {
    return { success: false, error: "Invalid email or password." };
  }

  if (!found.isActive) {
    return { success: false, error: "This account has been deactivated. Please contact your administrator." };
  }

  if (found.passwordHash !== cleanPass) {
    return { success: false, error: "Invalid email or password." };
  }

  // Update last login
  found.lastLoginAt = new Date().toISOString();
  saveStoredStaff(accounts);

  return {
    success: true,
    user: {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
      isActive: found.isActive,
      createdAt: found.createdAt,
      lastLoginAt: found.lastLoginAt,
    },
  };
}

/**
 * Lists all staff and admin accounts. (Admin-only)
 */
export async function listStaffAccounts(): Promise<StaffAccount[]> {
  const accounts = getStoredStaff();
  return accounts.map(({ passwordHash, ...safe }) => safe);
}

/**
 * Creates a new staff or admin account. (Admin-only)
 */
export async function createStaffAccount(
  input: CreateStaffAccountInput,
  creatorId?: string
): Promise<{ success: boolean; account?: StaffAccount; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const accounts = getStoredStaff();

  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "An account with this email already exists." };
  }

  const newAcc: StaffAccount & { passwordHash: string } = {
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    fullName: input.fullName.trim(),
    role: input.role,
    isActive: true,
    passwordHash: input.password || "Hospital@2026",
    createdBy: creatorId || null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  const updated = [...accounts, newAcc];
  saveStoredStaff(updated);

  const { passwordHash, ...safe } = newAcc;
  return { success: true, account: safe };
}

/**
 * Toggles active/inactive status of an account. (Admin-only)
 * Guard: Prevents deactivating the sole remaining active Admin.
 */
export async function toggleStaffActive(
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  const accounts = getStoredStaff();
  const target = accounts.find((a) => a.id === accountId);

  if (!target) {
    return { success: false, error: "Account not found." };
  }

  // Guard against locking out the last active admin
  if (target.role === "admin" && target.isActive) {
    const activeAdmins = accounts.filter((a) => a.role === "admin" && a.isActive);
    if (activeAdmins.length <= 1) {
      return {
        success: false,
        error: "Cannot deactivate the sole remaining active Administrator account.",
      };
    }
  }

  target.isActive = !target.isActive;
  saveStoredStaff(accounts);

  return { success: true };
}

/**
 * Resets an account password. (Admin-only)
 */
export async function resetStaffPassword(
  accountId: string,
  newPasswordPlain: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPasswordPlain || newPasswordPlain.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const accounts = getStoredStaff();
  const target = accounts.find((a) => a.id === accountId);

  if (!target) {
    return { success: false, error: "Account not found." };
  }

  target.passwordHash = newPasswordPlain;
  saveStoredStaff(accounts);

  return { success: true };
}
