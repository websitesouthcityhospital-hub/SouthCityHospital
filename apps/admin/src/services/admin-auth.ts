import type {
  StaffAccount,
  CreateStaffAccountInput,
  AuthSession,
  UserRole,
} from "@sch/types";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STAFF_STORAGE_KEY = "sch_staff_accounts_store";

function mapDbAccountToStaffAccount(dbRow: Record<string, any>): StaffAccount {
  return {
    id: dbRow.id,
    email: dbRow.email,
    fullName: dbRow.full_name || dbRow.fullName || "",
    role: (dbRow.role as UserRole) || "staff",
    isActive: dbRow.is_active !== undefined ? Boolean(dbRow.is_active) : Boolean(dbRow.isActive),
    createdBy: dbRow.created_by || dbRow.createdBy || null,
    createdAt: dbRow.created_at || dbRow.createdAt || new Date().toISOString(),
    updatedAt: dbRow.updated_at || dbRow.updatedAt || new Date().toISOString(),
    lastLoginAt: dbRow.last_login_at || dbRow.lastLoginAt || null,
  };
}

function getStoredStaffAccounts(): (StaffAccount & { passwordHash: string })[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STAFF_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredStaffAccounts(accounts: (StaffAccount & { passwordHash: string })[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STAFF_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to persist staff accounts to localStorage:", err);
  }
}

/**
 * Authenticates an admin or staff user via Supabase Auth / Supabase Database.
 * Securely enforces account active status and sets up session.
 */
export async function authenticateAdminUser(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: "Please provide both email and password." };
  }

  const supabase = createClient();

  if (supabase) {
    // 1. Primary: Supabase Auth (Sign in with Supabase Auth credentials)
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!authError && authData.user) {
        // Fetch staff profile from staff_accounts table
        const { data: staffData } = await supabase
          .from("staff_accounts")
          .select("*")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (staffData && !staffData.is_active) {
          await supabase.auth.signOut();
          return {
            success: false,
            error: "This staff account has been deactivated. Please contact an administrator.",
          };
        }

        const finalRole: UserRole =
          staffData?.role ||
          (authData.user.user_metadata?.role as UserRole) ||
          "admin";

        const fullName: string =
          staffData?.full_name ||
          authData.user.user_metadata?.full_name ||
          authData.user.email?.split("@")[0] ||
          "Administrator";

        if (!staffData) {
          // Automatically register newly created Supabase Auth user into staff_accounts
          try {
            await supabase.from("staff_accounts").upsert({
              id: authData.user.id,
              email: cleanEmail,
              full_name: fullName,
              role: finalRole,
              is_active: true,
              password_hash: "SUPABASE_AUTH_MANAGED",
              last_login_at: new Date().toISOString(),
            });
          } catch (upsertErr) {
            console.warn("Auto-provision staff account warning:", upsertErr);
          }
        } else if (staffData?.id) {
          // Update last login timestamp in staff_accounts
          await supabase
            .from("staff_accounts")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", staffData.id);
        }

        const session: AuthSession = {
          id: staffData?.id || authData.user.id,
          email: authData.user.email || cleanEmail,
          fullName,
          role: finalRole,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        };

        return { success: true, session };
      }
    } catch (authErr) {
      console.warn("Supabase Auth sign-in attempted, evaluating database verification...", authErr);
    }

    // 2. Secondary: Supabase RPC (verify_staff_credentials with Postgres bcrypt/crypt)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "verify_staff_credentials",
        {
          p_email: cleanEmail,
          p_password: cleanPass,
        }
      );

      if (!rpcError && rpcData) {
        if (rpcData.success && rpcData.user) {
          const session: AuthSession = {
            id: rpcData.user.id,
            email: rpcData.user.email,
            fullName: rpcData.user.fullName || rpcData.user.full_name,
            role: rpcData.user.role as UserRole,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          };
          return { success: true, session };
        } else if (rpcData.error) {
          return { success: false, error: rpcData.error };
        }
      }
    } catch (rpcErr) {
      console.warn("Supabase RPC verify_staff_credentials fallback:", rpcErr);
    }

    // 3. Tertiary: Direct Supabase database table query
    try {
      const { data: directData, error: directError } = await supabase
        .from("staff_accounts")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (!directError && directData) {
        if (!directData.is_active) {
          return {
            success: false,
            error: "This staff account has been deactivated. Please contact an administrator.",
          };
        }

        if (directData.password_hash === cleanPass) {
          await supabase
            .from("staff_accounts")
            .update({ last_login_at: new Date().toISOString() })
            .eq("id", directData.id);

          const session: AuthSession = {
            id: directData.id,
            email: directData.email,
            fullName: directData.full_name,
            role: directData.role as UserRole,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          };
          return { success: true, session };
        }
      }
    } catch (directErr) {
      console.warn("Supabase staff_accounts direct query error:", directErr);
    }
  }

  // 4. Local storage fallback if Supabase is offline
  const localAccounts = getStoredStaffAccounts();
  const matchedLocal = localAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (matchedLocal) {
    if (!matchedLocal.isActive) {
      return {
        success: false,
        error: "This staff account has been deactivated. Please contact an administrator.",
      };
    }

    if (matchedLocal.passwordHash === cleanPass) {
      matchedLocal.lastLoginAt = new Date().toISOString();
      saveStoredStaffAccounts(localAccounts);

      const session: AuthSession = {
        id: matchedLocal.id,
        email: matchedLocal.email,
        fullName: matchedLocal.fullName,
        role: matchedLocal.role,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      };
      return { success: true, session };
    }
  }

  return { success: false, error: "Invalid email or password." };
}

/**
 * Lists all staff and admin accounts from Supabase (or local fallback).
 */
export async function listStaffAccounts(): Promise<StaffAccount[]> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .select("id, email, full_name, role, is_active, created_by, created_at, updated_at, last_login_at")
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map(mapDbAccountToStaffAccount);
      }
    } catch (err) {
      console.warn("Supabase listStaffAccounts fallback to local store:", err);
    }
  }

  const local = getStoredStaffAccounts();
  return local.map(({ passwordHash: _, ...safe }) => safe);
}

/**
 * Creates a new staff or admin account in Supabase.
 */
export async function createStaffAccount(
  input: CreateStaffAccountInput,
  createdByAdminId?: string
): Promise<{ success: boolean; account?: StaffAccount; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.fullName.trim();
  const cleanPass = input.password.trim();

  if (!cleanEmail || !cleanName || !cleanPass) {
    return { success: false, error: "All fields are required." };
  }

  const supabase = createClient();
  if (supabase) {
    // 1. Try RPC create_staff_account
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("create_staff_account", {
        p_email: cleanEmail,
        p_password: cleanPass,
        p_full_name: cleanName,
        p_role: input.role,
        p_created_by: createdByAdminId || null,
      });

      if (!rpcError && rpcData) {
        if (rpcData.success && rpcData.account) {
          return { success: true, account: mapDbAccountToStaffAccount(rpcData.account) };
        } else if (rpcData.error) {
          return { success: false, error: rpcData.error };
        }
      }
    } catch (rpcErr) {
      console.warn("Supabase create_staff_account RPC fallback:", rpcErr);
    }

    // 2. Direct insert into staff_accounts
    try {
      const { data, error } = await supabase
        .from("staff_accounts")
        .insert({
          email: cleanEmail,
          full_name: cleanName,
          role: input.role,
          password_hash: cleanPass,
          is_active: true,
          created_by: createdByAdminId || null,
        })
        .select()
        .single();

      if (!error && data) {
        return { success: true, account: mapDbAccountToStaffAccount(data) };
      } else if (error) {
        if (error.code === "23505" || error.message.includes("unique")) {
          return { success: false, error: "An account with this email address already exists." };
        }
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn("Supabase direct staff account insert error:", err);
    }
  }

  // Local fallback
  const accounts = getStoredStaffAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "An account with this email address already exists." };
  }

  const newAccount: StaffAccount & { passwordHash: string } = {
    id: `staff-${Date.now()}`,
    email: cleanEmail,
    fullName: cleanName,
    role: input.role,
    isActive: true,
    passwordHash: cleanPass,
    createdBy: createdByAdminId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  accounts.push(newAccount);
  saveStoredStaffAccounts(accounts);

  const { passwordHash: _, ...safeAccount } = newAccount;
  return { success: true, account: safeAccount };
}

/**
 * Toggles a staff account's active state in Supabase.
 */
export async function toggleStaffActive(
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  if (supabase) {
    try {
      const { data: target, error: fetchError } = await supabase
        .from("staff_accounts")
        .select("*")
        .eq("id", accountId)
        .single();

      if (!fetchError && target) {
        if (target.role === "admin" && target.is_active) {
          const { count } = await supabase
            .from("staff_accounts")
            .select("*", { count: "exact", head: true })
            .eq("role", "admin")
            .eq("is_active", true);

          if (count !== null && count <= 1) {
            return {
              success: false,
              error: "Cannot deactivate the only active Administrator account in the system.",
            };
          }
        }

        const { error: updateError } = await supabase
          .from("staff_accounts")
          .update({ is_active: !target.is_active, updated_at: new Date().toISOString() })
          .eq("id", accountId);

        if (!updateError) {
          return { success: true };
        }
        return { success: false, error: updateError.message };
      }
    } catch (err: any) {
      console.warn("Supabase toggleStaffActive fallback to local:", err);
    }
  }

  const accounts = getStoredStaffAccounts();
  const target = accounts.find((a) => a.id === accountId);

  if (!target) {
    return { success: false, error: "Account not found." };
  }

  if (target.role === "admin" && target.isActive) {
    const activeAdmins = accounts.filter((a) => a.role === "admin" && a.isActive);
    if (activeAdmins.length <= 1) {
      return {
        success: false,
        error: "Cannot deactivate the only active Administrator account in the system.",
      };
    }
  }

  target.isActive = !target.isActive;
  target.updatedAt = new Date().toISOString();
  saveStoredStaffAccounts(accounts);

  return { success: true };
}

/**
 * Resets a staff member's password in Supabase.
 */
export async function resetStaffPassword(
  accountId: string,
  newPasswordPlain: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPass = newPasswordPlain.trim();
  if (!cleanPass) {
    return { success: false, error: "Password cannot be empty." };
  }

  const supabase = createClient();
  if (supabase) {
    // 1. Try RPC reset_staff_password
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("reset_staff_password", {
        p_account_id: accountId,
        p_new_password: cleanPass,
      });

      if (!rpcError && rpcData?.success) {
        return { success: true };
      }
    } catch (rpcErr) {
      console.warn("Supabase reset_staff_password RPC fallback:", rpcErr);
    }

    // 2. Direct update in staff_accounts
    try {
      const { error: updateError } = await supabase
        .from("staff_accounts")
        .update({
          password_hash: cleanPass,
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);

      if (!updateError) {
        return { success: true };
      }
      return { success: false, error: updateError.message };
    } catch (err: any) {
      console.warn("Supabase direct reset password error:", err);
    }
  }

  const accounts = getStoredStaffAccounts();
  const target = accounts.find((a) => a.id === accountId);

  if (!target) {
    return { success: false, error: "Account not found." };
  }

  target.passwordHash = cleanPass;
  target.updatedAt = new Date().toISOString();
  saveStoredStaffAccounts(accounts);

  return { success: true };
}
