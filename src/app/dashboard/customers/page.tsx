import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomersClient from './CustomersClient';

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all calendars owned by this user to get their IDs
  const { data: calendars } = await supabase
    .from('calendars')
    .select('id')
    .eq('user_id', user.id);

  if (!calendars || calendars.length === 0) {
    return <CustomersClient initialCustomers={[]} />;
  }

  const calendarIds = calendars.map(c => c.id);

  // Fetch all bookings (even cancelled) for these calendars to determine unique customers
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booker_email, booker_name, start_time')
    .in('calendar_id', calendarIds)
    .order('start_time', { ascending: false });

  // Aggregate unique customers
  const customersMap = new Map();

  if (bookings) {
    bookings.forEach(booking => {
      const email = (booking.booker_email || '').toLowerCase().trim();
      if (!customersMap.has(email)) {
        customersMap.set(email, {
          email: email,
          name: booking.booker_name,
          latest_booking: booking.start_time,
          total_bookings: 1
        });
      } else {
        const existing = customersMap.get(email);
        existing.total_bookings += 1;
        // Since it's ordered by most recent start_time descending, the first one we saw is the newest
      }
    });
  }

  const customers = Array.from(customersMap.values());

  return <CustomersClient initialCustomers={customers} />;
}
