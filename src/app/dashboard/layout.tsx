import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from './DashboardSidebar';
import './dashboard-shell.css';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="ds-root">
      <DashboardSidebar email={user.email ?? ''} />
      <main className="ds-main">
        <div className="ds-main-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
