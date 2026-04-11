import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white group hover:w-64 transition-all overflow-hidden lg:static">
        <div className="flex h-full flex-col px-3 py-4">
          <div className="mb-8 px-2 flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Booker</span>
          </div>

          <nav className="flex-1 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 group"
            >
              <svg className="mr-3 h-5 w-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link
              href="/dashboard/bookings"
              className="flex items-center rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 group"
            >
              <svg className="mr-3 h-5 w-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Bookings
            </Link>
            <Link
              href="/dashboard/customers"
              className="flex items-center rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 group"
            >
              <svg className="mr-3 h-5 w-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Customers
            </Link>
            <Link
              href="/dashboard/emails"
              className="flex items-center rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 group"
            >
              <svg className="mr-3 h-5 w-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Emails
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 group"
            >
              <svg className="mr-3 h-5 w-5 text-slate-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Settings
            </Link>
          </nav>

          <div className="border-t border-slate-100 pt-4">
             {/* Logout button or User Profile */}
             <div className="flex items-center px-2 py-3">
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
               </div>
             </div>
             <form action="/auth/sign-out" method="post">
                <button
                  className="flex w-full items-center rounded-lg px-2 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  type="submit"
                >
                  <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
             </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
