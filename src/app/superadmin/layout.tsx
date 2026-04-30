import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// --- PLACEHOLDER FOR SUPERADMIN EMAIL ---
const ALLOWED_ADMIN_EMAILS = [
  'hi@hisubhadeep.com', 
  // Add more emails here as needed
];

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ALLOWED_ADMIN_EMAILS.includes(user.email || '')) {
    // If not a superadmin, kick them back to the dashboard
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-600 selection:text-white">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tighter text-indigo-600 uppercase">Superadmin</span>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="/superadmin" className="border-indigo-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold uppercase tracking-widest">
                  Overview
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <a href="/dashboard" className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                Return to App
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
