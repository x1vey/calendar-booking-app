import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function MyCalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: settings } = await supabase
    .from('user_settings')
    .select('google_refresh_token')
    .eq('user_id', user.id)
    .single();

  const isConnected = !!settings?.google_refresh_token;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 grotesque-heading">My Calendar</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Your live Google Calendar schedule</p>
      </div>

      {!isConnected ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Connect Google Calendar</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm">Link your Google account in Settings to see your live schedule here.</p>
          <a 
            href="/dashboard/settings" 
            className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm inline-flex items-center justify-center rounded-lg font-bold h-10 px-4 py-2 text-sm transition-colors"
          >
            Go to Settings
          </a>
        </Card>
      ) : (
        <div className="rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 bg-white">
          <iframe 
            src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(user.email || 'primary')}&ctz=${Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}&mode=WEEK&showTitle=0&showNav=1&showPrint=0&showCalendars=0&showTz=1`}
            style={{ border: 0 }}
            width="100%"
            height="700"
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          />
        </div>
      )}

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
        <p className="font-bold mb-1">💡 Tip</p>
        <p>Make sure your Google Calendar is set to <strong>"Make available to public"</strong> in Google Calendar Settings → Access permissions for the embed to display your events. Your booking availability checks work independently of this setting.</p>
      </div>
    </div>
  );
}
