export type UserRole = "admin" | "staff";

export interface StaffAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface CreateStaffAccountInput {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateStaffAccountInput {
  id: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

export interface AuthSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  expiresAt: string;
}
