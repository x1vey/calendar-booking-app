import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PageBuilderWrapper from './PageBuilderWrapper';

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !calendar) {
    return <div className="p-8">Page not found or you do not have permission to edit it.</div>;
  }

  return (
    <div className="h-[calc(100vh-100px)] -mx-4 sm:-mx-6 lg:-mx-8">
      <PageBuilderWrapper initialCalendar={calendar} />
    </div>
  );
}
