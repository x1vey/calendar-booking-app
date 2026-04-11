# Calendar Booking App — Developer Guide

## Overview
This is a Next.js 14 (App Router) application built for self-serve calendar bookings. It integrates with Supabase, Google Calendar, and Resend/Gmail SMTP.

## Project Structure
- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: UI components (using Tailwind CSS).
- `/src/lib`: Core logic (Supabase, Google Calendar, Mail, Timezone).
- `/supabase`: SQL migration files.

## Local Development

### 1. Prerequisites
- Node.js 18+
- Supabase account & project
- Google Cloud project with Calendar API enabled
- Resend account (for default email)

### 2. Setup
```bash
git clone <repo-url>
cd calendar-booking
npm install
```

### 3. Environment Variables
Create a `.env.local` file based on the template:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

RESEND_API_KEY=
RESEND_FROM_EMAIL=

CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
Run the SQL in `supabase/migration.sql` against your Supabase SQL Editor to create the necessary tables and enums.

### 5. Run it
```bash
npm run dev
```

## Deployment on Vercel
1. Push your code to a GitHub repository.
2. Link the repository to a new Vercel project.
3. Add all environment variables from `.env.local` to the Vercel project settings.
4. **Important**: The `vercel.json` is already configured for the 15-minute cron job. Vercel will detect this automatically.

## Naming Conventions
- **Components**: PascalCase (e.g., `BookingForm.tsx`).
- **Files/Folders**: kebab-case (e.g., `api-utils.ts`).
- **Database**: snake_case for tables and columns.
- **Enums**: snake_case.

## Adding Features
- **UI**: Add components to `/src/components/ui/` or specialized folders.
- **Logic**: Add standalone utilities to `/src/lib/`.
- **API**: Create new routes in `/src/app/api/`.

## Testing
- Test API routes using Postman or `curl`.
- Use the UI to verify slot generation and booking flow.
- Check Supabase Logs and Tables to ensure data is persisting correctly.

## Email Configuration
Users can choose between:
1. **Resend**: Default transactional email service.
2. **Google SMTP**: Using their Gmail/Workspace email + App Password.
