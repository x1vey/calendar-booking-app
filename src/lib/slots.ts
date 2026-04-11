import { addMinutes, format, parse, set, isAfter, isBefore, isEqual, startOfDay, endOfDay } from 'date-fns';
import { toDate, formatInTimeZone } from 'date-fns-tz';
import { getFreeBusy } from './google-calendar';
import { Calendar, SlotRule, Booking, AvailableSlot } from './types';
import { createAdminClient } from './supabase/admin';

export async function generateAvailableSlots(
  calendar: Calendar,
  dateStr: string, // YYYY-MM-DD
  bookerTimezone: string,
  googleToken?: string | null
): Promise<AvailableSlot[]> {
  const supabase = createAdminClient();

  // 1. Fetch rules for this calendar
  const { data: rules } = await supabase
    .from('slot_rules')
    .select('*')
    .eq('calendar_id', calendar.id);

  if (!rules || rules.length === 0) return [];

  // 2. Determine day of week
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const dayOfWeek = date.getDay(); // 0-6

  const dailyRules = rules.filter((r: SlotRule) => r.day_of_week === dayOfWeek);
  if (dailyRules.length === 0) return [];

  // 3. Generate all possible slots from rules
  let potentialSlots: { start: Date; end: Date }[] = [];

  for (const rule of dailyRules) {
    // start_time is e.g. "09:00:00" in calendar timezone
    const [startH, startM] = rule.start_time.split(':').map(Number);
    const [endH, endM] = rule.end_time.split(':').map(Number);

    let current = toDate(dateStr, { timeZone: calendar.timezone });
    current = set(current, { hours: startH, minutes: startM, seconds: 0, milliseconds: 0 });
    
    const endLimit = set(toDate(dateStr, { timeZone: calendar.timezone }), { 
      hours: endH, 
      minutes: endM, 
      seconds: 0, 
      milliseconds: 0 
    });

    while (isBefore(addMinutes(current, calendar.slot_duration_minutes), endLimit) || 
           isEqual(addMinutes(current, calendar.slot_duration_minutes), endLimit)) {
      
      const slotEnd = addMinutes(current, calendar.slot_duration_minutes);
      potentialSlots.push({ start: current, end: slotEnd });
      current = slotEnd;
    }
  }

  // 4. Filter out items in the past
  const now = new Date();
  potentialSlots = potentialSlots.filter(s => isAfter(s.start, now));

  // 5. Fetch existing bookings across ALL calendars of this user
  // This ensures that if a user has multiple booking pages, a slot booked
  // on one calendar blocks it on all others (since they share one schedule)
  let allUserCalendarIds: string[] = [calendar.id];

  if (calendar.user_id) {
    const { data: userCalendars } = await supabase
      .from('calendars')
      .select('id')
      .eq('user_id', calendar.user_id);

    if (userCalendars && userCalendars.length > 0) {
      allUserCalendarIds = userCalendars.map(c => c.id);
    }
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .in('calendar_id', allUserCalendarIds)
    .eq('status', 'confirmed')
    .gte('start_time', startOfDay(date).toISOString())
    .lte('start_time', endOfDay(date).toISOString());

  // 6. Google Calendar Free/Busy check
  let busyRanges: { start: string; end: string }[] = [];
  const activeToken = googleToken || null;

  console.log(`[SLOTS DEBUG] Google token for free/busy: ${activeToken ? 'YES' : 'NULL'}`);

  if (activeToken) {
    try {
      const queryStart = startOfDay(date).toISOString();
      const queryEnd = endOfDay(date).toISOString();
      console.log(`[SLOTS DEBUG] Querying Google free/busy: ${queryStart} → ${queryEnd}`);

      const busy = await getFreeBusy(activeToken, queryStart, queryEnd);
      console.log(`[SLOTS DEBUG] Google free/busy raw response:`, JSON.stringify(busy));

      // Filter out invalid busy periods and ensure they are typed as {start: string, end: string}
      busyRanges = (busy || [])
        .filter(b => b.start && b.end)
        .map(b => ({ start: b.start as string, end: b.end as string }));

      console.log(`[SLOTS DEBUG] Parsed ${busyRanges.length} busy ranges:`, JSON.stringify(busyRanges));
    } catch (e: any) {
      console.error('[SLOTS DEBUG] Failed to fetch free/busy:', e?.message || e);
    }
  } else {
    console.log('[SLOTS DEBUG] Skipping Google free/busy check — no token available');
  }

  // 7. Filter slots — remove any that conflict with bookings or Google busy times
  const availableSlots: AvailableSlot[] = potentialSlots.filter(slot => {
    // Check internal bookings (across all user calendars)
    const internalConflict = bookings?.some((b: Booking) => {
      const bStart = new Date(b.start_time);
      const bEnd = new Date(b.end_time);
      
      // Overlap detection: two ranges overlap if one starts before the other ends
      return isBefore(slot.start, bEnd) && isAfter(slot.end, bStart);
    });

    // For 1:1 calls, any booking conflict means unavailable
    if (internalConflict && calendar.call_type === 'one_on_one') return false;
    // For group calls, we would count attendees here. Simplified for now.

    // Check Google Calendar busy ranges
    const gCalConflict = busyRanges.some(busy => {
      const bStart = new Date(busy.start);
      const bEnd = new Date(busy.end);
      return isBefore(slot.start, bEnd) && isAfter(slot.end, bStart);
    });

    if (gCalConflict) return false;

    return true;
  }).map(slot => ({
    startTime: slot.start.toISOString(),
    endTime: slot.end.toISOString(),
    localStartTime: formatInTimeZone(slot.start, bookerTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    localEndTime: formatInTimeZone(slot.end, bookerTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }));

  return availableSlots;
}
