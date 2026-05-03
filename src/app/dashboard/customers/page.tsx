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
    return <CustomersClient initialCustomers={[]} stats={{ totalBookings: 0, totalTimeSpent: 0, avgTimeOnPage: '0s', ctr: '0%' }} />;
  }

  const calendarIds = calendars.map(c => c.id);

  // Fetch all bookings (even cancelled) for these calendars to determine unique customers
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booker_email, booker_name, start_time, end_time, status')
    .in('calendar_id', calendarIds)
    .order('start_time', { ascending: false });

  // Aggregate unique customers
  const customersMap = new Map();
  let totalBookings = 0;
  let totalTimeSpentHours = 0;

  if (bookings) {
    bookings.forEach(booking => {
      // Calculate Stats
      if (booking.status !== 'cancelled') {
        totalBookings += 1;
        if (booking.start_time && booking.end_time) {
          const start = new Date(booking.start_time).getTime();
          const end = new Date(booking.end_time).getTime();
          totalTimeSpentHours += (end - start) / (1000 * 60 * 60);
        }
      }

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
      }
    });
  }

  const customers = Array.from(customersMap.values());
  
  // Mocked analytics for landing page engagement (until DB tracking is implemented)
  const stats = {
    totalBookings,
    totalTimeSpent: totalTimeSpentHours,
    avgTimeOnPage: '2m 14s',
    ctr: '12.8%'
  };

  return <CustomersClient initialCustomers={customers} stats={stats} />;
}
