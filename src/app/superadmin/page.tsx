'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function SuperadminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/stats')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
    </div>
  </div>;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 grotesque-heading uppercase">Platform Overview</h1>
        <p className="text-slate-500 font-bold mt-2">Global metrics and account health across Call Me.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-none ring-1 ring-slate-200 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Users</p>
          <p className="text-5xl font-black text-slate-900">{data?.stats.totalUsers}</p>
        </Card>
        <Card className="p-8 border-none ring-1 ring-slate-200 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Calendars</p>
          <p className="text-5xl font-black text-slate-900">{data?.stats.totalCalendars}</p>
        </Card>
        <Card className="p-8 border-none ring-1 ring-slate-200 shadow-xl shadow-slate-200/50">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Bookings</p>
          <p className="text-5xl font-black text-indigo-600">{data?.stats.totalBookings}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-0 overflow-hidden border-none ring-1 ring-slate-200 shadow-2xl">
          <div className="bg-slate-50 border-b border-slate-100 p-6">
             <h3 className="font-black uppercase tracking-widest text-sm text-slate-900">Recent Accounts</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.recentUsers.map((u: any) => (
              <div key={u.user_id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : u.display_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">{u.display_name || 'Unnamed User'}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{u.user_id.slice(0,8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined/Active</p>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{new Date(u.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 border-none ring-1 ring-slate-200 bg-indigo-600 text-white flex flex-col justify-center text-center">
           <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">Ready to Scale?</h3>
           <p className="text-indigo-100 font-bold text-sm max-w-xs mx-auto mb-8 opacity-80">This dashboard uses the Service Role client to bypass RLS and monitor all platform data safely.</p>
           <div className="flex justify-center space-x-4">
             <div className="h-1 lg:h-2 w-16 bg-white/20 rounded-full"></div>
             <div className="h-1 lg:h-2 w-16 bg-white/20 rounded-full"></div>
             <div className="h-1 lg:h-2 w-16 bg-white/20 rounded-full"></div>
           </div>
        </Card>
      </div>
    </div>
  );
}
