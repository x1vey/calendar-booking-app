import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EmailsClient from './EmailsClient';

export default async function EmailsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: calendars } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!calendars || calendars.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Templates</h1>
          <p className="mt-1 text-sm text-slate-500">Manage confirmation and reminder emails for your calendars.</p>
        </div>
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-sm">Please create a calendar first to manage its email templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Email Templates</h1>
        <p className="mt-1 text-sm text-slate-500">Manage confirmation and reminder emails. Templates are localized to each calendar so you can customize them based on the event context.</p>
      </div>

      <EmailsClient initialCalendars={calendars} />
    </div>
  );
}
