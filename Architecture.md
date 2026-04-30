# Architecture & System Overview

This document explains the core flow and architecture of the "Call Me" booking platform in the simplest way possible.

## 1. Database (Supabase)
We use Supabase (a PostgreSQL wrapper) to store our data. The core tables are:
- `user_settings`: Holds the user's global profile (`avatar_url`, `about_me`, `display_name`) and their global credentials (`google_refresh_token`, `smtp_user`, `smtp_pass`).
- `calendars`: The different types of calls a user can have (e.g., "15 Min Discovery Call"). It holds configuration like duration, Call Type (1:1 vs Group), and **Landing Page** settings (like `hero_image_url`, `youtube_video_url`, etc.).
- `slot_rules`: The weekly hours the user is available to take calls (e.g., Mon 9-5).
- `bookings`: The actual appointments made by external people.
- `email_templates`: The customized emails sent for confirmations, reminders, and review requests.

## 2. Authentication & Admin Dashboard
- **Login:** Users log in via `/login`, utilizing Supabase Auth.
- **Middleware:** `src/lib/supabase/middleware.ts` runs on every request. If someone tries to access `/dashboard` without being logged in, they are kicked back to `/login`. 
- **Dashboard:** At `/dashboard`, the user can manage their platform. This includes:
  - `src/app/dashboard/settings/page.tsx`: Modifies the global `user_settings`.
  - `src/app/dashboard/calendar/[id]/page.tsx`: A massive tabbed editor for configuring the specific `calendar` rules, building its landing page, and mapping its email templates.

## 3. The Booking Flow (Public Facing)
When a client goes to `callme.com/book/their-call`:
1. **Frontend:** `src/app/book/[slug]/page.tsx` starts loading.
2. **Metadata Fetch:** It instantly calls `GET /api/calendar-meta/[slug]`. This returns both the calendar settings AND the user's profile info (avatar, display name). It uses this to render the beautiful public landing page.
3. **Slot Fetch:** Once the client selects a date on the calendar, it calls `GET /api/slots/[slug]`.
4. **Slot Generation Engine:** This is where the magic happens!
   - It fetches the `slot_rules` to see when the host *wishes* to work.
   - It fetches existing `bookings` from the database to block off taken times.
   - Importantly, it uses the host's `google_refresh_token` to make a live API call to Google Calendar. It overlays their *actual* personal/work schedule on top, ensuring mathematically zero double-bookings.
5. **Booking Creation:** When the user fills out their name and email, it POSTs to `/api/book`. This:
   - Saves the booking row in the database.
   - Makes an API call to Google Calendar to actually generate the Google Meet event and grab the Meet link.
   - Redirects the user to the Confirmation Page.

## 4. The Email & Cron System
Emails are NOT sent immediately by the frontend (that would be slow). We use an automated "Cron Job" background system.

- **Vercel Cron:** Vercel automatically hits `GET /api/cron/send-emails` every 15 minutes.
- **The Brain:** Inside `src/app/api/cron/send-emails/route.ts`, the system:
  1. Looks for upcoming bookings and checks if a reminder is due.
  2. Looks for past bookings and checks if a follow-up or a **review request** is due.
- **The Mailer:** It uses `src/lib/mail.ts` to render the custom `email_templates` from the database. It then dispatches the email using either Resend (our default) or the user's own connected Google SMTP credentials.

## 5. Google Calendar Embed
- **The View:** On the dashboard, `/dashboard/my-calendar/page.tsx` displays an embedded calendar.
- **The Engine:** It calls `GET /api/google-calendar/events/route.ts`. This secure backend route makes an API call to Google using the stored `google_refresh_token` and fetches the events for the past 20 days and next 20 days so you can see your real-life schedule.
