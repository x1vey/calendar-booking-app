'use client';

/**
 * ThemedBookingClient
 * ────────────────────
 * Client component that:
 *  1. Dynamically imports the correct calendar component at runtime.
 *  2. Fetches slots from /api/slots/[slug] when a date is selected.
 *  3. Submits bookings to /api/book.
 *
 * Kept deliberately thin — all business logic lives in the server page and
 * the presentational calendar components.
 */

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import type { CalendarTheme } from '@/lib/themes';
import type { AvailableSlot } from '@/lib/types';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ThemedBookingClientProps {
  slug: string;
  themeKey: CalendarTheme;
  /** Component filename — matches keys in THEMES[*].component */
  componentName: string;
  studioName: string;
  tagline?: string;
  location?: string;
  accentColor: string;
  previewBg: string;
  htmlOverrides: {
    headerPrefix?: string;
    headerSuffix?: string;
    footer?: string;
  };
}

// ─── Map component name → dynamic import ─────────────────────────────────────
// next/dynamic doesn't support truly dynamic string paths, so we map explicitly.
// This also gives us full type safety on the component props.
function useCalendarComponent(componentName: string) {
  // Each branch is a static string so webpack can code-split correctly.
  switch (componentName) {
    case 'FitnessBookingCalendar':
      return dynamic(() => import('@/components/calendars/FitnessBookingCalendar'), { ssr: false });
    case 'TattooBookingCalendar':
      return dynamic(() => import('@/components/calendars/TattooBookingCalendar'), { ssr: false });
    case 'GarmentBookingCalendar':
      return dynamic(() => import('@/components/calendars/GarmentBookingCalendar'), { ssr: false });
    default:
      return dynamic(() => import('@/components/calendars/DefaultBookingCalendar'), { ssr: false });
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ThemeSkeleton({ bg }: { bg: string }) {
  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 480, padding: '2rem' }}>
        {[80, 32, 280, 200].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: '1rem', background: 'rgba(128,128,128,0.12)', animation: 'pulse 1.8s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ThemedBookingClient({
  slug,
  componentName,
  studioName,
  tagline,
  location,
  accentColor,
  previewBg,
  htmlOverrides,
}: ThemedBookingClientProps) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const bookerTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Dynamic component — memoised to prevent recreation on re-render
  const [CalendarComponent] = useState(() => useCalendarComponent(componentName));

  // ── Fetch slots for a selected date ─────────────────────────────────────────
  const handleDateSelect = async (date: Date) => {
    setSlotsLoading(true);
    setSlots([]);
    try {
      const res = await fetch(
        `/api/slots/${slug}?date=${format(date, 'yyyy-MM-dd')}&timezone=${encodeURIComponent(bookerTimezone)}`
      );
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Submit booking ───────────────────────────────────────────────────────────
  const handleBook = async (
    slot: AvailableSlot,
    bookerName: string,
    bookerEmail: string,
  ) => {
    setBookingLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarSlug: slug,
          bookerName,
          bookerEmail,
          bookerTimezone,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Booking failed');

      // Redirect to confirmation page (consistent with existing flow)
      window.location.href = `/book/${slug}/confirmed?id=${data.booking.id}`;
    } catch (err: any) {
      alert(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Suspense fallback={<ThemeSkeleton bg={previewBg} />}>
      <CalendarComponent
        {...{
          studioName,
          tagline,
          location,
          accentColor,
          slots,
          onDateSelect: handleDateSelect,
          onBook: handleBook,
          slotsLoading,
          bookingLoading,
          headerPrefix: htmlOverrides.headerPrefix,
          headerSuffix: htmlOverrides.headerSuffix,
          footer: htmlOverrides.footer,
        } as any}
      />
    </Suspense>
  );
}
