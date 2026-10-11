# CollabX — Supabase Integration & Multi-User Setup Guide

This guide walks you through connecting your CollabX portal to Supabase for multi-account synchronization across Students, Supervisors/Researchers, and Admins.

---

## 1. Zero-Downtime Safe Fallback Architecture
CollabX features an **adaptive dual-mode backend engine**:
- **When Supabase credentials are provided (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)**: CollabX automatically connects to Supabase, persists all applications, projects, notifications, and team memberships in real-time to PostgreSQL, and syncs across active browser sessions.
- **When credentials are missing or unconfigured**: CollabX seamlessly falls back to its local demo engine (`localStorage` + seed database). Your site will **never crash or show a white screen** in staging, preview deployments, or local development without credentials.

---

## 2. Step-by-Step Supabase Setup

### Step A: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and log in.
2. Click **New Project**.
3. Choose your organization, assign a Name (e.g., `collabx-portal`), generate a strong Database Password, and select your preferred region.
4. Click **Create new project** (takes ~1-2 minutes to provision).

### Step B: Run the Database Migration Script
1. In your Supabase Dashboard sidebar, click **SQL Editor**.
2. Click **New query**.
3. Copy the entire contents of `supabase/schema.sql` (or `src/db/supabase-schema.sql`) from this repository.
4. Paste it into the SQL editor and click **Run** (or `Cmd/Ctrl + Enter`).
5. You will see `Success. No rows returned`. All tables (`profiles`, `projects`, `applications`, `project_members`, `notifications`, `messages`, `papers`, `research_areas`), RLS policies, and demo records are now live!

### Step C: Configure Supabase Authentication
1. Go to **Authentication** > **Providers** in the Supabase Dashboard.
2. Ensure **Email** is enabled.
3. Recommended for frictionless student/faculty onboarding:
   - Go to **Authentication** > **Email Templates / Settings**.
   - Under **User Signups**, optionally disable **Confirm email** if you want students and faculty to immediately log in without waiting for an email confirmation link.

### Step D: Copy Your API Keys
1. In your Supabase Dashboard, go to **Project Settings** (gear icon) > **API**.
2. Copy the following two values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **Project API Keys** > `anon` / `public` key

---

## 3. Configure Environment Variables

### In Vercel (Production & Custom Domain)
1. Go to your project on [vercel.com](https://vercel.com).
2. Navigate to **Settings** > **Environment Variables**.
3. Add:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-public-key`
4. Check all environments (**Production**, **Preview**, **Development**).
5. Click **Save** and trigger a **Redeploy** in the Deployments tab.

### In Local Development
Create or update `.env.local` in your project root:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```
Then restart Vite:
```bash
npm run dev
```

---

## 4. Multi-Account Verification Workflow

Once connected:
1. **Student Account (`ash@university.edu` or custom registered student)**:
   - Browse projects and submit a join request / application with message and skills note.
   - The application is immediately saved in the Supabase `applications` table.
2. **Supervisor Account (`fahim@university.edu` or project owner)**:
   - In another browser tab or window, open the Researcher Dashboard.
   - The student's application appears immediately.
   - Click **Approve**.
   - The status updates to `approved`, the student is automatically added to `project_members`, and an in-app notification is dispatched to the student's notification center in real-time.
3. **Admin Account (`admin@collabx.org`)**:
   - Access the Admin Dashboard to moderate projects, manage institutional users, and view platform metrics.
