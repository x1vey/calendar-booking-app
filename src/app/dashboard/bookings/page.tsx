import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { redirect } from 'next/navigation';
import GlobalBookingsClient from './GlobalBookingsClient';

export default async function GlobalBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all calendars owned by this user to get their IDs
  const { data: calendars } = await supabase
    .from('calendars')
    .select('id, name')
    .eq('user_id', user.id);

  if (!calendars || calendars.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Bookings</h1>
            <p className="mt-1 text-sm text-slate-500">View all upcoming and past bookings across your calendars.</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No calendars yet</h3>
          <p className="text-slate-500 text-sm">Create a calendar first to start receiving bookings.</p>
        </Card>
      </div>
    );
  }

  const calendarIds = calendars.map(c => c.id);

  // Fetch all bookings for these calendars
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, calendars(name)')
    .in('calendar_id', calendarIds)
    .order('start_time', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">View all upcoming and past bookings across your calendars.</p>
        </div>
      </div>

      <GlobalBookingsClient initialBookings={bookings || []} />
    </div>
  );
}
