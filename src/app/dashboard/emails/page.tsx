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
      <>
        <header className="cm-head">
          <div>
            <h1 className="cm-h1">Email <em>templates</em></h1>
            <div className="cm-cap">CONFIRMATION & REMINDER EMAILS FOR YOUR CALENDARS</div>
          </div>
        </header>
        <div className="cm-empty">
          <div className="cm-empty-art">✉</div>
          <h3 className="cm-empty-title">No calendars yet</h3>
          <p className="cm-empty-msg">Create a calendar first — then you can customize the emails that go to each booker.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="cm-head">
        <div>
          <h1 className="cm-h1">Email <em>templates</em></h1>
          <div className="cm-cap">LOCALIZED PER CALENDAR · CUSTOMIZE TO MATCH YOUR VOICE</div>
        </div>
      </header>

      <EmailsClient initialCalendars={calendars} />
    </>
  );
}
