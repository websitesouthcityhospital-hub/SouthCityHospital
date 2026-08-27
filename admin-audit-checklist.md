# Admin Portal Data Audit & Hardcoded Data Elimination Checklist

This document details every page, component, and data element within the South City Hospital Admin Portal (`apps/admin`), tracking whether data is loaded live from PostgreSQL/Supabase or is currently mock/localStorage/hardcoded.

---

## 1. Inventory of Admin Pages & Data Elements

### 1.1 Authentication & Layout Shell
- **Page / Component**: `apps/admin/src/app/login/page.tsx`
  - [x] **Email & Password Inputs**: Live input, no default/hardcoded values.
  - [x] **Auth Verification**: Gated live through `/api/auth/login` (Supabase Auth / Postgres bcrypt RPC).
  - [x] **Role Redirection**: Dynamic destination (`/dashboard` for admin, `/bookings` for staff).

- **Page / Component**: `apps/admin/src/components/AdminLayout.tsx`
  - [x] **Current User Identity**: Live from `/api/auth/me` (`user.fullName`, `user.email`, `user.role`).
  - [x] **RBAC Navigation Filtering**: Dynamic navigation items based on `currentUser.role`.
  - [x] **Logout Flow**: Live termination via `/api/auth/logout`.

---

### 1.2 Operational Dashboard (`/dashboard`)
- **Page**: `apps/admin/src/app/dashboard/page.tsx`
  - [ ] **Snapshot Metric: Total Bookings Today**: *VIOLATION* &rarr; Fallback was reading `localStorage` instead of Supabase live aggregate query.
  - [ ] **Snapshot Metric: Appointments Remaining**: *VIOLATION* &rarr; Computed from `localStorage` instead of live status filter against DB.
  - [ ] **Snapshot Metric: Doctors Unavailable Today**: *VIOLATION* &rarr; Reading from `localStorage` `getStoredExceptions()`.
  - [ ] **Snapshot Metric: Patients Triaged Today**: *VIOLATION* &rarr; Set count over `localStorage` appointments.
  - [ ] **Today's Live Consultations Table**: *VIOLATION* &rarr; Reads from `localStorage` on initial render; needs live Supabase query join with `doctors` and `departments`.
  - [ ] **Appointment Status Change Dropdown**: Updates status via service, but needs live optimistic update and database RPC synchronization.
  - [ ] **Doctor Availability (Today) Panel**: *VIOLATION* &rarr; Exception matching uses `localStorage` `getStoredExceptions()`.
  - [ ] **7-Day Booking Volume Histogram**: *VIOLATION* &rarr; Slices `localStorage` appointments.
  - [ ] **Recent Patient Registrations Card Grid**: *VIOLATION* &rarr; Slices `localStorage` appointments.

---

### 1.3 Bookings Hub (`/bookings`)
- **Page**: `apps/admin/src/app/bookings/page.tsx`
  - [x] **Daily Appointments List**: Queries `getBookingsForDate` with Supabase fallback. Needs guaranteed live DB query without local mock fallback masking DB errors.
  - [x] **Doctor Filter Dropdown**: Fetches from `/api/doctors` (live DB backed).
  - [ ] **Department Name / Info**: *VIOLATION* &rarr; Reads static `departments.ts` file instead of `departments` table in Supabase.
  - [x] **Booking Search Bar (`BookingSearchBar.tsx`)**: Queries `searchBookingsAdmin` against `public.appointments` (`idx_appointments_ref`, `idx_appointments_lookup`).
  - [x] **Excel Export**: Uses live queried data.

---

### 1.4 Doctor Management (`/doctors`)
- **Page**: `apps/admin/src/app/doctors/page.tsx`
  - [x] **Doctor Roster Grid**: Fetches from `/api/doctors` which queries `public.doctors`.
  - [ ] **Department Dropdown (Create/Edit Modal)**: *VIOLATION* &rarr; Imports static `departments.ts` array instead of live `departments` DB query.
  - [x] **Doctor Photo Upload**: Uploads directly to Supabase Storage bucket `doctor-avatars`.
  - [x] **Doctor Creation/Update/Delete**: Executes upsert/delete on `public.doctors` via `/api/doctors`.

---

### 1.5 Doctor Schedules & Availability Exceptions (`/schedules`)
- **Page**: `apps/admin/src/app/schedules/page.tsx`
- **Service**: `apps/admin/src/services/doctor-schedules.ts`
  - [ ] **Doctor Selector**: Fetches from `/api/doctors`.
  - [ ] **Doctor Weekly Shift Schedules Table**: *CRITICAL VIOLATION* &rarr; Read/written entirely via `localStorage` (`sch_doctor_weekly_schedules`). Needs live DB integration with `public.doctor_weekly_schedules`.
  - [ ] **Calendar Leave & Exceptions Grid**: *CRITICAL VIOLATION* &rarr; Read/written entirely via `localStorage` (`sch_doctor_exceptions`). Needs live DB integration with `public.doctor_exceptions`.
  - [ ] **Department Reference**: *VIOLATION* &rarr; Static import of `departments.ts`.

---

### 1.6 Patients CRM & Lifetime Visit Timeline (`/patients`)
- **Page**: `apps/admin/src/app/patients/page.tsx`
  - [ ] **Patients Registry Table**: *CRITICAL VIOLATION* &rarr; Populated by parsing `localStorage` `sch_appointments_store`. Needs live DB query against `public.patients` joined with `public.appointments`.
  - [ ] **Patient Demographics Card**: *VIOLATION* &rarr; Derived from `localStorage`.
  - [ ] **Cross-Visit Consultation Timeline**: *VIOLATION* &rarr; Derived from `localStorage`.

---

### 1.7 Staff & RBAC Accounts (`/staff`)
- **Page**: `apps/admin/src/app/staff/page.tsx`
- **Service**: `apps/admin/src/services/admin-auth.ts`
  - [x] **Staff Accounts Table**: Live fetch from `public.staff_accounts` via `/api/staff`.
  - [x] **Create Staff Account**: Live insert / RPC `create_staff_account` with `pgcrypto` bcrypt.
  - [x] **Toggle Active Status**: Live update on `public.staff_accounts.is_active`.
  - [x] **Reset Staff Password**: Live update / RPC `reset_staff_password`.

---

## 2. Summary of Violations to Eliminate

| # | Component / Page | Violation Description | Target DB Source / Table |
|---|---|---|---|
| 1 | `apps/admin/src/app/dashboard/page.tsx` | Metrics, live roster, and forecast calculated from `localStorage.getItem("sch_appointments_store")` | Live Supabase aggregation / query on `appointments`, `doctors`, `doctor_exceptions` |
| 2 | `apps/admin/src/app/patients/page.tsx` | Patient list & visit timeline parsed from `localStorage` | Live query on `patients` table & `appointments` table |
| 3 | `apps/admin/src/services/doctor-schedules.ts` | Weekly schedules stored in `localStorage` | Live query & mutation on `doctor_weekly_schedules` table |
| 4 | `apps/admin/src/services/doctor-schedules.ts` | Leave exceptions stored in `localStorage` | Live query & mutation on `doctor_exceptions` table |
| 5 | `apps/admin/src/app/schedules/page.tsx` | Reads/writes schedules and exceptions via `localStorage` | Live API/service methods against Supabase |
| 6 | `apps/admin/src/data/departments.ts` | Static hardcoded department array used across `/doctors`, `/bookings`, `/schedules` | Live query on `departments` table via `/api/departments` or service |
| 7 | `apps/admin/src/services/admin-bookings.ts` | Local storage fallback silently masking database queries | Ensure pure database query pipeline with proper loading/error states |
