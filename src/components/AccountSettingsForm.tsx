'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Settings {
  google_refresh_token: string | null;
  smtp_user: string | null;
  smtp_pass: string | null;
}

export default function AccountSettingsForm({ initialSettings, userId }: { initialSettings: Settings | null, userId: string }) {
  const [settings, setSettings] = useState(initialSettings || {
    google_refresh_token: null,
    smtp_user: '',
    smtp_pass: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp_user: settings.smtp_user,
          smtp_pass: settings.smtp_pass,
        }),
      });
      alert('Settings saved!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Calendar? Bookings will no longer sync with Google.')) return;
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_refresh_token: null }),
      });
      setSettings({ ...settings, google_refresh_token: null });
    } catch (err) {
      alert('Failed to disconnect');
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar Connection */}
      <Card className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Google Calendar</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Connect your Google account to automatically create events for every booking and check your real-time availability.
            </p>
          </div>
          {!settings.google_refresh_token ? (
            <Button onClick={() => window.location.href = `/api/calendar/connect?userId=${userId}`}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect Google Calendar
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-emerald-600 font-bold text-sm">
                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = `/api/calendar/connect?userId=${userId}`}>
                Reconnect
              </Button>
              <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={handleDisconnectGoogle}>
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {settings.google_refresh_token && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-emerald-800 space-y-1">
                <p className="font-semibold">Your Google Calendar is active</p>
                <p>All new bookings across your calendars will automatically create a Google Calendar event. Slots that conflict with your existing Google Calendar events will be shown as unavailable.</p>
              </div>
            </div>
          </div>
        )}

        {!settings.google_refresh_token && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-amber-800 space-y-1">
                <p className="font-semibold">Google Calendar not connected</p>
                <p>Without Google Calendar, bookings won't check your real-time availability and events won't be auto-created. Connect to enable full sync.</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* SMTP Settings */}
      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-1">
             <h3 className="text-lg font-semibold text-slate-900">Email Notifications (SMTP)</h3>
             <p className="text-sm text-slate-500">Configure your SMTP credentials for sending booking confirmations, reminders, and follow-ups.</p>
           </div>
           
           <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-start space-x-3">
             <svg className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <div className="text-xs text-indigo-800">
               <p className="font-semibold mb-1">Using Gmail / Google Workspace?</p>
               <p>1. Enable 2-Step Verification on your Google account.</p>
               <p>2. Go to Security → App Passwords and generate one.</p>
               <p>3. Use the 16-character code as the password below.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="SMTP User / Email" 
                placeholder="you@email.com"
                value={settings.smtp_user || ''}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
              />
              <Input 
                label="Sender App Password" 
                type="password"
                placeholder="•••• •••• •••• ••••"
                value={settings.smtp_pass || ''}
                onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
              />
           </div>
           
           <div className="pt-4 flex justify-end">
             <Button type="submit" disabled={saving}>
               {saving ? 'Saving...' : 'Save Email Settings'}
             </Button>
           </div>
        </form>
      </Card>
    </div>
  );
}
