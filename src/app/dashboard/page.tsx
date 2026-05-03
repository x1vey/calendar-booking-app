import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import ShareConfigurator from '@/components/ShareConfigurator';
import DeleteCalendarButton from '@/components/DeleteCalendarButton';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout handles redirect
  }

  const { data: calendars, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch all bookings for these calendars to calculate stats
  let totalBookings = 0;
  let totalRevenue = 0;
  let averageRevenue = 0;

  if (calendars && calendars.length > 0) {
    const calendarIds = calendars.map(c => c.id);
    const { data: bookings } = await supabase
      .from('bookings')
      .select('amount_paid')
      .in('calendar_id', calendarIds);

    if (bookings) {
      totalBookings = bookings.length;
      totalRevenue = bookings.reduce((acc, curr) => acc + (Number(curr.amount_paid) || 0), 0);
      averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    }
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Bookings</div>
          <div className="text-3xl font-black text-slate-900">{totalBookings}</div>
        </Card>
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Revenue</div>
          <div className="text-3xl font-black text-slate-900">${totalRevenue.toFixed(2)}</div>
        </Card>
        <Card className="p-6 bg-white shadow-sm border-slate-200">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Avg. per Booking</div>
          <div className="text-3xl font-black text-slate-900">${averageRevenue.toFixed(2)}</div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Call Pages</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your booking types and availability</p>
        </div>
        <Link href="/dashboard/calendar/new">
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Call Page
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          Failed to load calendars: {error.message}
        </div>
      )}

      {calendars && calendars.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No call pages yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">Create your first public booking page to start accepting appointments.</p>
          <Link href="/dashboard/calendar/new">
            <Button variant="outline" className="font-bold">Create a Call Page</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calendars?.map((calendar) => (
            <Card key={calendar.id} className="p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {calendar.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">/{calendar.slug}</p>
                </div>
                <div className={calendar.is_active ? "w-2 h-2 rounded-full bg-emerald-500" : "w-2 h-2 rounded-full bg-slate-300"} title={calendar.is_active ? "Active" : "Inactive"}></div>
              </div>
              
              <div className="flex items-center text-xs text-slate-500 space-x-4 mb-6">
                <span className="flex items-center">
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {calendar.slot_duration_minutes}m
                </span>
                <span className="flex items-center">
                  <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {calendar.call_type === 'one_on_one' ? '1:1' : `Group (${calendar.max_attendees})`}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                <div className="flex space-x-2">
                  <ShareConfigurator calendar={calendar} />
                  <DeleteCalendarButton calendarId={calendar.id} />
                </div>
                <Link href={`/dashboard/calendar/${calendar.id}`}>
                  <Button variant="ghost" size="sm">Edit</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
