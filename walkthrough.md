# Walkthrough: Supabase Backend Integration

We have successfully migrated the frontend's local storage state simulation layer to a live PostgreSQL relational database on Supabase.

---

## 🚀 Step 1: Initialize Database Tables & Schema

We have generated a ready-to-run database schema script for you.

1. Open your **Supabase Dashboard**.
2. Click on the **SQL Editor** tab (the `SQL` icon on the left sidebar).
3. Click **New Query**.
4. Open the [supabase_schema.sql](file:///c:/Users/abith/Downloads/sportsync-alexandria/supabase_schema.sql) file inside the project, copy the entire SQL script, and paste it into the Supabase editor.
5. Click **Run**.

This script will instantly:
- Create all 7 required tables: `profiles`, `facilities`, `slots`, `bookings`, `waitlist`, `audit_logs`, and `admin_config`.
- Set up **Row Level Security (RLS)** public policies allowing testing from client-side code.
- Seed default facilities (Badminton, Cricket nets, Basketball, Tennis courts).
- Seed default accounts:
  * **Admin**: `VIT-AD-001` / `admin123`
  * **Student 1**: `20BCE1022` / `student123`
  * **Student 2**: `21BKT2045` / `student123`

---

## 🛠️ Step 2: Live Connection Details

We configured a `.env` file containing your Supabase project properties in the project root:
- `VITE_SUPABASE_URL`: `https://efzngdzhmtgipvcaojcz.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `sb_publishable_vQUli-ghiOeo06Lpo0qONA_8uPq3LlB`

---

## 🏗️ Technical Details of the Migration

1. **Supabase Client**: Created [supabaseClient.ts](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/utils/supabaseClient.ts) to initialize the `@supabase/supabase-js` SDK client using environment variables.
2. **Database Utility Class**: Created [supabaseDb.ts](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/utils/supabaseDb.ts) which wraps all system queries using PostgreSQL actions. Handles:
   - Snake-case (database) to camel-case (TypeScript) mappings.
   - User authentication and ban verification.
   - Dynamic slots status modifications, bulk generation, and outdoor bulk weather cancellation algorithms.
   - Concurrent bookings increment, double-booking checking, and daily slot booking quotas.
   - Waitlist priority entry addition and automatic booking promotions.
   - GDPR logs purging.
3. **MockDatabase Redirection**: Updated [mockDb.ts](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/utils/mockDb.ts) to export `SupabaseDatabase` as `MockDatabase`. This preserves the existing import targets, ensuring zero impact on other files.
4. **Asynchronous UI Handlers**: Upgraded [App.tsx](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/App.tsx) and [AuthView.tsx](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/components/AuthView.tsx) to handle database queries using `async/await` patterns. Added data calculation adapters to the [AdminReportsView.tsx](file:///c:/Users/abith/Downloads/sportsync-alexandria/src/components/AdminReportsView.tsx) report graphs.
5. **Static Code Validation**: Codebase successfully validated and builds without errors (`npx tsc --noEmit` returns **0 errors**).
