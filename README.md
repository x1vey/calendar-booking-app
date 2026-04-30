# Call Me (Booking Platform)

A high-end, full-stack appointment scheduling application built with **Next.js 14+ (App Router)**, **Supabase**, and **Google Calendar API**.

## Features
- **Premium "Call Me" Branding**: Modern, sleek, fast-loading UI utilizing a linear vertical sales funnel structure out of the box.
- **Landing Page Builder & Theming**: Every calendar has its own customizable public page and style config. You can inject custom CSS variables (Background, text, heading, and accent colors) via the platform editor.
- **Dynamic Funnel Layout**: Built-in VSL (Video Sales Letter) placements, Text Expectations, real-time Booking Grid, Testimonial Videos (with automatic robust ID extraction for YouTube shorts and videos), and Native Google Reviews.
- **Minimal Mode Toggle**: Easily turn the full landing page into a clean, minimal booking-only widget directly via the Superadmin dashboard.
- **Native Google Reviews Setup**: Uses Google Places API to dynamically fetch and display live reviews inside your funnel, bypassing iframe limitations.
- **Global Profile Settings**: Personalized avatars and bios that reflect across your booking pages.
- **Embedded Google Calendar**: View your real Google Calendar schedule right from your dashboard.
- **Automated Review Requests**: Post-call email triggers asking your clients for Google Reviews.
- **Timezone Awareness**: Automatic detection and manual switching for bookers.
- **Multi-Provider Email**: Send notifications via **Resend** or **Google SMTP** (Gmail/Workspace).
- **Global Google Calendar Sync**: Connect your Google Calendar at the account level for automatic event creation and real-time free/busy checks to ensure no double-booking.
- **Superadmin Dashboard**: Dedicated `/superadmin` root access showing global platform metrics, user counts, bookings, and recent account creation analytics (using Supabase Service Role configuration to bypass RLS).

## 🚀 Getting Started

### 1. Database Setup (Supabase)
This app uses Supabase for database and authentication.
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy and run the code from the `supabase/migration.sql` (and `migration2.sql`) files to create the tables, enums, customization fields, and RLS policies.

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

GOOGLE_PLACES_API_KEY=your_places_api_key

RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=your_verified_sender_email

CRON_SECRET=your_random_string_for_cron
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 🔑 Vendor API Registration Guide

Follow these steps to obtain all required keys:

#### A. Supabase (Database & Auth)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and go to **Project Settings** > **API**.
3. Copy the **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`).
4. Copy the **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Copy the **service_role secret** (`SUPABASE_SERVICE_ROLE_KEY`). **Never** expose this key on the frontend.

#### B. Google Cloud (Calendar, Places & OAuth)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Go to **APIs & Services** > **Library** and enable the **Google Calendar API** and **Places API**.
4. Create an **API Key** for the Places API and apply the restrictions to it (`GOOGLE_PLACES_API_KEY`).
5. Go to **APIs & Services** > **OAuth consent screen**:
   * Choose **External**.
   * Add `https://www.googleapis.com/auth/calendar.events` and `https://www.googleapis.com/auth/calendar.readonly` to Scopes.
   * While in Testing mode, add your email as a **Test User**.
6. Go to **APIs & Services** > **Credentials**:
   * Click **Create Credentials** > **OAuth client ID**.
   * Select **Web application**.
   * Add required origin callbacks for authentication.

#### C. Resend (Default Email)
1. Create an account at [Resend.com](https://resend.com).
2. Go to **API Keys** and create a new key with "Sending" permissions.

### 4. Application Flow & Architecture 
The application handles multi-layered routing:
- **Server and Client Supabase Integrations**: `src/lib/supabase` provides specific implementations of the client, server, and service-role auth instances depending on rendering context. 
- **Dynamic CSS Variable Injection**: The `/book/[slug]/page.tsx` page computes root `--theme-*` style values dynamically generated from user settings and overrides the Tailwind defaults.
- **Robust Video Extraction logic**: Native JS regex extracts IDs across a variety of URL shapes (e.g. `shorts/`, `v=`) guaranteeing components don't visually break for bad inputs.
- **Admin/Superadmin Protection**: A hard-coded fallback email layer exists in `src/app/superadmin/layout.tsx` to stop arbitrary access. Make sure your actual email string replaces the placeholder!

### 5. Local Development
```bash
npm install
npm run dev
```

## 🛠️ Project Structure
- `/src/lib`: Core logic for Google Calendar, Emailing (Resend/SMTP), Slot Generation, and Database clients.
- `/src/components`: Reusable UI components and specialized Landing Page configuration editors.
- `/src/app/api`: Backend routes for booking, API proxies for Google Reviews, slot calculation, and cron jobs.
- `/src/app/dashboard`: Protected application user administration interface.
- `/src/app/superadmin`: Protected master platform metrics and global user monitoring interface.
- `/src/app/book`: Public-facing booking pages with multi-layout generation based on user preferences.
