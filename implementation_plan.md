# Implementation Plan: Supabase Backend Integration

Migrate the frontend local storage state simulation layer to a live PostgreSQL relational database on Supabase.

---

## User Review Required

> [!IMPORTANT]
> To configure the live connection, we need you to provide your Supabase Project details:
> 1. **Supabase API URL**: (e.g., `https://xxxx.supabase.co`)
> 2. **Supabase Anon Key**: (e.g., public api key)
>
> We will create a `.env` file in your project root to hold these environment variables.

---

## Proposed Changes

We will install `@supabase/supabase-js` and create a database connection module. We will write SQL migration scripts that you can copy and paste into the Supabase SQL Editor to initialize all tables, default facilities, slots, and indexes. Finally, we will refactor the database abstraction layer (`src/utils/mockDb.ts` / new `src/utils/supabaseClient.ts`) to use asynchronous fetching.

### 1. Dependencies
- Install `@supabase/supabase-js`.

### 2. Database Schema (SQL Migration script)
Create SQL script containing tables for:
- `profiles` (mapping users with credentials, roles and sport preferences)
- `facilities` (sport facility list)
- `slots` (generated time slots)
- `bookings` (active slot reservations)
- `waitlist` (waitlist entries for slots)
- `audit_logs` (GDPR tracking & activity logging)
- `admin_config` (system configurations)

### 3. Application Components

#### [NEW] [supabaseClient.ts](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/utils/supabaseClient.ts)
- Initialize the Supabase client using environment variables.

#### [MODIFY] [mockDb.ts](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/utils/mockDb.ts) (or new `dbService.ts`)
- Replace local storage operations with asynchronous Supabase calls (using async/await).
- Ensure existing functions retain signatures but return `Promise<T>`.

#### [MODIFY] [App.tsx](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/App.tsx)
- Refactor state fetch logic (`syncLocalStates` and interactions) to be `async/await` driven, displaying loaders during queries.

---

## Verification Plan

### Automated Verification
- Run compilation checks (`npx tsc --noEmit`) to verify React types match promise-returning databases.
- Test connection checks via simple script.

### Manual Verification
- Verify login, signup, booking creation, waitlist promotion, and audit log generation persist in the Supabase Table Editor.
