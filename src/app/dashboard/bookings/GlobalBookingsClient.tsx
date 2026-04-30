'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function GlobalBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings);

  if (bookings.length === 0) {
    return (
      <Card className="p-12 text-center text-slate-500 italic text-sm">
        No bookings found.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Booker</th>
              <th className="px-6 py-3">Calendar</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Link</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{booking.booker_name}</div>
                  <div className="text-xs text-slate-400">{booking.booker_email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-700">
                    {booking.calendars?.name || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                  <div className="text-xs">{new Date(booking.start_time).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                  {booking.source || '-'}
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                     {booking.status}
                   </span>
                </td>
                <td className="px-6 py-4">
                  {booking.meet_link ? (
                    <a href={booking.meet_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Meet
                    </a>
                  ) : '-'}
                  <div className="mt-1 flex flex-col gap-1">
                    <a href={`/reschedule/${booking.cancellation_token}`} target="_blank" className="text-[10px] text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-wider">Reschedule Link</a>
                    <a href={`/cancel/${booking.cancellation_token}`} target="_blank" className="text-[10px] text-slate-400 hover:text-rose-600 font-bold uppercase tracking-wider">Cancel Link</a>
                  </div>
                </td>
                <td className="px-6 py-4 flex flex-col gap-2">
                  {booking.status === 'confirmed' && (
                    <>
                      <Button variant="outline" size="sm" className="text-[10px] h-7" onClick={() => window.open(`/reschedule/${booking.cancellation_token}`, '_blank')}>Reschedule</Button>
                      <Button variant="ghost" size="sm" className="text-[10px] h-7 text-rose-500" onClick={async () => {
                        if (confirm('Cancel this booking?')) {
                          await fetch('/api/cancel', { method: 'POST', body: JSON.stringify({ token: booking.cancellation_token }) });
                          setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                        }
                      }}>Cancel</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
