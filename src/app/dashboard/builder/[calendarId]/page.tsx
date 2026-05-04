import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BuilderShell from '@/components/builder/BuilderShell';

export default async function BuilderPage({ params }: { params: Promise<{ calendarId: string }> }) {
  const { calendarId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .single();

  if (error || !calendar) {
    notFound();
  }

  return <BuilderShell initialCalendar={calendar} />;
}

