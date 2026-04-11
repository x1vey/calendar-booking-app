import { formatInTimeZone, toDate } from 'date-fns-tz';

export const TIMEZONES = Intl.supportedValuesOf('timeZone');

export function formatInTimezone(date: Date | string | number, timezone: string, formatStr: string) {
  return formatInTimeZone(date, timezone, formatStr);
}

export function getNowInTimezone(timezone: string) {
  return toDate(new Date(), { timeZone: timezone });
}

export function convertToUTC(dateStr: string, timezone: string) {
  const date = toDate(dateStr, { timeZone: timezone });
  return date.toISOString();
}

export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
