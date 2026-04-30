'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TIMEZONES } from '@/lib/timezone';

export default function NewCalendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    call_type: 'one_on_one' as 'one_on_one' | 'group',
    max_attendees: 1,
    slot_duration_minutes: 30,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    meeting_provider: 'google_meet',
    calendar_sync_provider: 'google',
  });

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-0]/g, '-').replace(/-+/g, '-');
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create calendar');

      router.push(`/dashboard/calendar/${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New Calendar</h1>
        <p className="text-sm text-slate-500">Define the type of calls you want to host.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Calendar Name"
              placeholder="e.g. Design Consultation"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />

            <Input
              label="Slug"
              placeholder="design-consultation"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                placeholder="What is this call about?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Call Type</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.call_type}
                  onChange={(e) => setFormData({ ...formData, call_type: e.target.value as any, max_attendees: e.target.value === 'one_on_one' ? 1 : 10 })}
                >
                  <option value="one_on_one">1:1 Session</option>
                  <option value="group">Group Call</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Duration (min)</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.slot_duration_minutes}
                  onChange={(e) => setFormData({ ...formData, slot_duration_minutes: Number(e.target.value) })}
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>

            {formData.call_type === 'group' && (
              <Input
                label="Max Attendees"
                type="number"
                min={1}
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
              />
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Base Timezone</label>
              <select
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 italic">Availability rules will be based on this timezone.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Meeting Location / Provider</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.meeting_provider}
                  onChange={(e) => setFormData({ ...formData, meeting_provider: e.target.value as any })}
                >
                  <option value="google_meet">Google Meet</option>
                  <option value="zoom">Zoom</option>
                  <option value="ms_teams">Microsoft Teams</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Calendar Sync Provider</label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.calendar_sync_provider}
                  onChange={(e) => setFormData({ ...formData, calendar_sync_provider: e.target.value as any })}
                >
                  <option value="google">Google Calendar</option>
                  <option value="outlook">Outlook</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Calendar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
