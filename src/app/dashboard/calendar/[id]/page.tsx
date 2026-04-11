'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TIMEZONES } from '@/lib/timezone';
import { Calendar, EmailTemplate, Booking } from '@/lib/types';
import AvailabilityEditor from '@/components/AvailabilityEditor';
import EmailEditor from '@/components/EmailEditor';

export default function CalendarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'settings' | 'availability' | 'email' | 'bookings'>('settings');
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`/api/admin/calendars`);
        const data = await res.json();
        const found = data.find((c: Calendar) => c.id === id);
        if (found) setCalendar(found);
        else throw new Error('Calendar not found');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, [id]);

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!calendar) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/calendars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendar),
      });
      if (!res.ok) throw new Error('Failed to update calendar');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-1/4"></div><div className="h-64 bg-slate-200 rounded"></div></div>;
  if (!calendar) return <div className="text-center py-12">Calendar not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{calendar.name}</h1>
          <p className="text-sm text-slate-500">Configure your booking and notification settings.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="outline" size="sm" onClick={() => window.open(`/book/${calendar.slug}`, '_blank')}>
             Preview Page
           </Button>
           <Button variant="danger" size="sm" onClick={async () => {
             if (confirm('Are you sure you want to delete this calendar?')) {
               await fetch(`/api/admin/calendars/${id}`, { method: 'DELETE' });
               router.push('/dashboard');
             }
           }}>
             Delete
           </Button>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200">
        {(['settings', 'availability', 'email', 'bookings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'settings' && (
          <Card className="p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Name"
                  value={calendar.name}
                  onChange={(e) => setCalendar({ ...calendar, name: e.target.value })}
                  required
                />
                <Input
                  label="Slug"
                  value={calendar.slug}
                  onChange={(e) => setCalendar({ ...calendar, slug: e.target.value })}
                  required
                />
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                    value={calendar.description || ''}
                    onChange={(e) => setCalendar({ ...calendar, description: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Call Type</label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={calendar.call_type}
                    onChange={(e) => setCalendar({ ...calendar, call_type: e.target.value as any, max_attendees: e.target.value === 'one_on_one' ? 1 : 10 })}
                  >
                    <option value="one_on_one">1:1 Session</option>
                    <option value="group">Group Call</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Duration (min)</label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={calendar.slot_duration_minutes}
                    onChange={(e) => setCalendar({ ...calendar, slot_duration_minutes: Number(e.target.value) })}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
                {calendar.call_type === 'group' && (
                   <Input
                    label="Max Attendees"
                    type="number"
                    value={calendar.max_attendees}
                    onChange={(e) => setCalendar({ ...calendar, max_attendees: Number(e.target.value) })}
                   />
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Base Timezone</label>
                  <select
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={calendar.timezone}
                    onChange={(e) => setCalendar({ ...calendar, timezone: e.target.value })}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                   <input
                    type="checkbox"
                    id="is_active"
                    checked={calendar.is_active}
                    onChange={(e) => setCalendar({ ...calendar, is_active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                   />
                   <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active (visible to public)</label>
                </div>
              </div>
              <div className="pt-6 border-t flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Other tabs will be implemented as sub-components or blocks */}
        {activeTab === 'availability' && <AvailabilityEditor calendarId={id as string} />}
        {activeTab === 'email' && <EmailEditor calendar={calendar} onUpdate={setCalendar} />}
        {activeTab === 'bookings' && <BookingsSection calendarId={id as string} />}
      </div>
    </div>
  );
}

function GoogleSection({ calendar, onUpdate }: { calendar: Calendar, onUpdate: (c: Calendar) => void }) {
  return (
    <Card className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Google Calendar Connection</h3>
          <p className="text-sm text-slate-500">Enable automatic event creation and free/busy checks.</p>
        </div>
        {!calendar.google_refresh_token ? (
           <Button onClick={() => window.location.href = `/api/calendar/connect?calendarId=${calendar.id}`}>
             Connect Google account
           </Button>
        ) : (
           <div className="flex items-center text-emerald-600 font-medium">
             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
             Connected
           </div>
        )}
      </div>
      {calendar.google_refresh_token && (
         <Button variant="ghost" size="sm" onClick={() => window.location.href = `/api/calendar/connect?calendarId=${calendar.id}`}>
           Reconnect or use another account
         </Button>
      )}
    </Card>
  );
}

function BookingsSection({ calendarId }: { calendarId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/bookings/${calendarId}`)
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
           setBookings(data);
         } else {
           console.error('Failed to load bookings:', data);
           setBookings([]);
         }
         setLoading(false);
      })
      .catch(err => {
         console.error('Error fetching bookings:', err);
         setBookings([]);
         setLoading(false);
      });
  }, [calendarId]);

  if (loading) return <div className="p-8 text-center">Loading bookings...</div>;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Booker</th>
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
                    <a href={booking.meet_link} target="_blank" className="text-indigo-600 hover:underline">Meet</a>
                  ) : '-'}
                </td>
                <td className="px-6 py-4">
                  {booking.status === 'confirmed' && (
                    <Button variant="ghost" size="sm" onClick={async () => {
                       if (confirm('Cancel this booking?')) {
                         await fetch('/api/cancel', { method: 'POST', body: JSON.stringify({ token: booking.cancellation_token }) });
                         setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                       }
                    }}>Cancel</Button>
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
