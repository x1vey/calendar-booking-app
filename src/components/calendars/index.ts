/**
 * components/calendars/index.ts
 * Barrel export for all aesthetic booking calendar components.
 *
 * All components are 'use client' and accept a consistent prop interface:
 *   - studioName, tagline, location, accentColor
 *   - slots, onDateSelect, onBook
 *   - slotsLoading, bookingLoading
 *   - headerPrefix, headerSuffix, footer  (raw HTML slot overrides)
 */

// ── Components ────────────────────────────────────────────────────────────────
export { default as FitnessBookingCalendar } from './FitnessBookingCalendar';
export { default as TattooBookingCalendar }  from './TattooBookingCalendar';
export { default as GarmentBookingCalendar } from './GarmentBookingCalendar';
export { default as DefaultBookingCalendar } from './DefaultBookingCalendar';

// ── Slot types ────────────────────────────────────────────────────────────────
export type { FitnessSlot, FitnessBookingCalendarProps } from './FitnessBookingCalendar';
export type { TattooSlot, TattooBookingCalendarProps }   from './TattooBookingCalendar';
export type { GarmentSlot, GarmentBookingCalendarProps } from './GarmentBookingCalendar';
export type { DefaultSlot, DefaultBookingCalendarProps } from './DefaultBookingCalendar';
