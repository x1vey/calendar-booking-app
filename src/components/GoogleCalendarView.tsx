'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  htmlLink?: string;
  hangoutLink?: string;
  isAllDay?: boolean;
}

export default function GoogleCalendarView({ userId }: { userId: string }) {
  const [events, setEvents] = useState<GEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/google-calendar/events');
        const data = await res.json();
        
        if (res.status === 400 && data.notConnected) {
          setNotConnected(true);
          return;
        }
        
        if (!res.ok) throw new Error(data.error);
        setEvents(data.events);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading Calendar...</div>;
  }

  if (notConnected) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 mb-6">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Connect Google Calendar</h3>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 max-w-sm">Connect your account to view your live schedule directly within Call Me.</p>
        <Button onClick={() => window.location.href = `/api/calendar/connect?userId=${userId}`} className="btn-pill font-bold shadow-lg shadow-blue-600/30">
          Connect Account
        </Button>
      </Card>
    );
  }

  if (error) {
    return <div className="p-6 bg-red-50 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-sm">{error}</div>;
  }

  // Generate calendar grid
  const startDate = startOfWeek(currentDate);
  const endDate = endOfWeek(addWeeks(currentDate, 3)); // show exactly 4 weeks
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <Card className="overflow-hidden bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 rounded-[2rem]">
       <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">
               {format(currentDate, 'MMMM yyyy')}
             </h2>
             <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest">
               Live Sync
             </span>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 4))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-slate-400 hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 4))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-slate-400 hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
       </div>

       <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100 last:border-0">
              {d}
            </div>
          ))}
       </div>

       <div className="grid grid-cols-7">
          {days.map((day, i) => {
             const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
             const isTdy = isToday(day);

             return (
               <div key={day.toString()} className={`min-h-[120px] p-2 border-b border-r border-slate-100 ${i % 7 === 6 ? 'border-r-0' : ''}`}>
                 <div className={`mb-2 w-8 h-8 flex items-center justify-center rounded-xl text-sm font-bold mx-auto transition-colors ${
                   isTdy ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 
                   !isSameMonth(day, currentDate) ? 'text-slate-300' : 'text-slate-700'
                 }`}>
                   {format(day, 'd')}
                 </div>
                 
                 <div className="space-y-1">
                   {dayEvents.map(evt => (
                     <a 
                       key={evt.id} 
                       href={evt.htmlLink} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="block px-2 py-1 text-[10px] leading-tight font-bold rounded bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 truncate transition-colors border border-slate-100"
                       title={evt.summary}
                     >
                       {!evt.isAllDay && <span className="mr-1 opacity-70">{format(new Date(evt.start), 'HH:mm')}</span>}
                       {evt.summary}
                     </a>
                   ))}
                   {dayEvents.length === 0 && (
                     <div className="text-center mt-4">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">-</span>
                     </div>
                   )}
                 </div>
               </div>
             );
          })}
       </div>
    </Card>
  );
}
