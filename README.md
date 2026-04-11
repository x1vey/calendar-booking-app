# Calendar Booking App

A lightweight, full-stack calendar booking application built with **Next.js 14+ (App Router)**, **Supabase**, and **Google Calendar API**.

## Features
- **Admin Dashboard**: Manage multiple calendars, view bookings, and configure availability.
- **Timezone Awareness**: Automatic detection and manual switching for bookers.
- **Multi-Provider Email**: Send notifications via **Resend** or **Google SMTP** (Gmail/Workspace).
- **Global Google Calendar Sync**: Connect your Google Calendar at the account level for automatic event creation and real-time free/busy checks to ensure no double-booking.
- **Cross-Calendar Unified Availability**: 1:1 bookings check for conflicts across all calendars owned by the user, ensuring a completely conflict-free schedule.
- **Self-Serve Cancellation**: Token-based cancellation links for users.

## 🚀 Getting Started

### 1. Database Setup (Supabase)
This app uses Supabase for database and authentication.
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the code from [supabase/migration.sql](file:///f:/My%20tech%20solutions/Calendar%20Booking/supabase/migration.sql) to create the tables, enums, and RLS policies.

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your_verified_sender_email

CRON_SECRET=your_random_string_for_cron
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 🔑 Vendor API Registration Guide

Follow these steps to obtain all required keys:

#### A. Supabase (Database & Auth)
1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project and go to **Project Settings** > **API**.
3.  Copy the **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`).
4.  Copy the **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5.  Copy the **service_role secret** (`SUPABASE_SERVICE_ROLE_KEY`). **Never** expose this key on the frontend.

#### B. Google Cloud (Calendar & OAuth)
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Go to **APIs & Services** > **Library** and enable the **Google Calendar API**.
4.  Go to **APIs & Services** > **OAuth consent screen**:
    *   Choose **External**.
    *   Add `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar.readonly` to Scopes.
    *   While in Testing mode, add your email as a **Test User**.
5.  Go to **APIs & Services** > **Credentials**:
    *   Click **Create Credentials** > **OAuth client ID**.
    *   Select **Web application**.
    *   Add `http://localhost:3000` to **Authorized JavaScript origins**.
    *   Add `http://localhost:3000/api/calendar/callback` to **Authorized redirect URIs**. (Update these with your production URL when deploying).
6.  Copy your **Client ID** and **Client Secret**.

#### C. Resend (Default Email)
1.  Create an account at [Resend.com](https://resend.com).
2.  Go to **API Keys** and create a new key with "Sending" permissions.
3.  Go to **Domains** and follow the instructions to verify your sending domain (or use the default `onboarding@resend.dev` for testing).

#### D. Google SMTP (Optional Provider)
If you want to use your personal Gmail/Workspace to send emails:
1.  Go to your [Google Account Security settings](https://myaccount.google.com/security).
2.  Ensure **2-Step Verification** is enabled.
3.  Search for **App Passwords**.
4.  Generate a new password (select "Email" and "Other").
5.  Use the 16-character code as your `smtp_pass` in the app's dashboard.

### 4. How it connects to Supabase
The app uses the `@supabase/ssr` package to manage authentication and database connections across the client and server.
- **Browser Client**: `src/lib/supabase/client.ts` initializes the client for React components.
- **Server Client**: `src/lib/supabase/server.ts` uses Next.js `cookies()` to maintain sessions in Server Components and Route Handlers.
- **Admin Client**: `src/lib/supabase/admin.ts` uses the `SERVICE_ROLE_KEY` to perform administrative tasks (like Cron jobs) that bypass Row Level Security.
- **Middleware**: `src/middleware.ts` ensures user sessions are refreshed automatically and protects the `/dashboard` routes.

### 4. Local Development
```bash
npm install
npm run dev
```

## 🛠️ Project Structure
- `/src/lib`: Core logic for Google Calendar, Emailing (Resend/SMTP), and Slot Generation.
- `/src/components`: Reusable UI components and specialized editors.
- `/src/app/api`: Backend routes for booking, slot calculation, and cron jobs.
- `/src/app/dashboard`: Protected admin interface.
- `/src/app/book`: Public-facing booking pages.

## 📦 Deployment
1. Link your GitHub repo to **Vercel**.
2. Add all environment variables to the Vercel project settings.
3. Vercel will automatically detect `vercel.json` and set up the 15-minute cron job for email reminders and follow-ups.
