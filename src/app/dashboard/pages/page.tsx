import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function PagesDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; 
  }

  // Fetch calendars to show their attached landing pages
  // Note: We're displaying calendars as "Pages" here until we fully migrate to standalone pages
  const { data: calendars, error } = await supabase
    .from('calendars')
    .select('id, name, slug, landing_page_enabled, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Landing Pages</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage standalone landing pages for your booking widgets</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
          Failed to load pages: {error.message}
        </div>
      )}

      {calendars && calendars.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
          <h3 className="text-lg font-bold text-slate-900">No pages found</h3>
          <p className="text-sm text-slate-500 mb-6">Create a calendar first to attach a landing page to it.</p>
          <Link href="/dashboard/calendar/new">
            <Button variant="outline" className="font-bold">Create Calendar</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {calendars?.map((calendar) => (
            <Card key={calendar.id} className="p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {calendar.name} Page
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">/book/{calendar.slug}</p>
                </div>
                <div className={calendar.landing_page_enabled ? "w-2 h-2 rounded-full bg-emerald-500" : "w-2 h-2 rounded-full bg-slate-300"} title={calendar.landing_page_enabled ? "Published" : "Draft"}></div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                <Link href={`/book/${calendar.slug}`} target="_blank">
                  <Button variant="outline" size="sm">View Live</Button>
                </Link>
                <Link href={`/dashboard/pages/${calendar.id}`}>
                  <Button size="sm">Open Builder</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
