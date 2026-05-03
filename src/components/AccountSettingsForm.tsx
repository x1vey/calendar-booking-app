'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Settings {
  google_refresh_token: string | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  avatar_url?: string | null;
  about_me?: string | null;
  display_name?: string | null;
  notification_email?: string | null;
  zoom_refresh_token?: string | null;
  microsoft_refresh_token?: string | null;
  slack_webhook_url?: string | null;
  stripe_secret_key?: string | null;
  stripe_publishable_key?: string | null;
  paypal_client_id?: string | null;
  paypal_secret?: string | null;
  razorpay_key_id?: string | null;
  razorpay_key_secret?: string | null;
}

export default function AccountSettingsForm({ initialSettings, userId }: { initialSettings: Settings | null, userId: string }) {
  const [settings, setSettings] = useState(initialSettings || {
    google_refresh_token: null,
    smtp_user: '',
    smtp_pass: '',
    avatar_url: '',
    about_me: '',
    display_name: '',
    notification_email: '',
    zoom_refresh_token: null,
    microsoft_refresh_token: null,
    slack_webhook_url: '',
    stripe_secret_key: '',
    stripe_publishable_key: '',
    paypal_client_id: '',
    paypal_secret: '',
    razorpay_key_id: '',
    razorpay_key_secret: '',
  });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('microsoft_connected')) {
      alert('Microsoft account connected successfully!');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('error')) {
      alert(`Error: ${params.get('error')}`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
          avatar_url: settings.avatar_url,
          about_me: settings.about_me,
          display_name: settings.display_name,
          notification_email: settings.notification_email,
          slack_webhook_url: settings.slack_webhook_url,
          stripe_secret_key: settings.stripe_secret_key,
          stripe_publishable_key: settings.stripe_publishable_key,
          paypal_client_id: settings.paypal_client_id,
          paypal_secret: settings.paypal_secret,
          razorpay_key_id: settings.razorpay_key_id,
          razorpay_key_secret: settings.razorpay_key_secret,
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

  const handleDisconnectZoom = async () => {
    if (!confirm('Are you sure you want to disconnect Zoom? New bookings using Zoom will fail.')) return;
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoom_refresh_token: null }),
      });
      setSettings({ ...settings, zoom_refresh_token: null });
    } catch (err) {
      alert('Failed to disconnect Zoom');
    }
  };

  const handleDisconnectMicrosoft = async () => {
    if (!confirm('Are you sure you want to disconnect Microsoft? Teams meetings and Outlook sync will stop.')) return;
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ microsoft_refresh_token: null }),
      });
      setSettings({ ...settings, microsoft_refresh_token: null });
    } catch (err) {
      alert('Failed to disconnect Microsoft');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-1">
             <h3 className="text-lg font-semibold text-slate-900">External Profile</h3>
             <p className="text-sm text-slate-500">How you appear on your booking pages.</p>
           </div>
           
           <div className="flex flex-col md:flex-row gap-6 items-start">
             <div className="shrink-0 space-y-2 text-center w-full md:w-32">
                <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
                  {settings.avatar_url ? (
                    <img src={settings.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-10 h-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview</div>
             </div>
             
             <div className="flex-1 w-full space-y-4">
                <Input 
                  label="Display Name" 
                  placeholder="Your Name"
                  value={settings.display_name || ''}
                  onChange={(e) => setSettings({ ...settings, display_name: e.target.value })}
                />
                <Input 
                  label="Avatar URL" 
                  placeholder="https://example.com/avatar.jpg"
                  value={settings.avatar_url || ''}
                  onChange={(e) => setSettings({ ...settings, avatar_url: e.target.value })}
                />
             </div>
           </div>

           <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium text-slate-700">About Me</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                placeholder="A short bio to display on your landing page..."
                value={settings.about_me || ''}
                onChange={(e) => setSettings({ ...settings, about_me: e.target.value })}
              />
           </div>
           
           <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
             <Button type="submit" disabled={saving}>
               {saving ? 'Saving...' : 'Save Profile'}
             </Button>
           </div>
        </form>
      </Card>

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

      {/* Zoom Connection */}
      <Card className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Zoom Setup</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Connect your Zoom account to automatically generate Zoom meetings for new bookings.
            </p>
          </div>
          {!settings.zoom_refresh_token ? (
            <Button onClick={() => window.location.href = `/api/zoom/connect?userId=${userId}`}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.585 13.607l-.27-.012H1.886l3.236-3.164.005-.005a.83.83 0 00.127-1.002.825.825 0 00-.705-.401H.857A.858.858 0 000 9.878v4.244c0 .474.385.858.857.858h3.766a.823.823 0 00.596-.245.856.856 0 00.222-.596v-.53a.856.856 0 00-.856-.855h-.002zM23.143 9.022L18.8 11.23a.846.846 0 00-.458.749v1.942a.853.853 0 00.449.754l4.348 2.228v-7.88zm-5.632-1.28c0-.62-.511-1.127-1.139-1.127l-5.636.002v8.528h2.09c.621 0 1.135-.512 1.138-1.14l.006-5.06h3.541v-1.203zM13.273 6.613l-5.65.002C7 6.615 6.49 7.126 6.49 7.749v5.044h3.535v1.203c0 .62.51 1.127 1.139 1.127h5.636V6.613h-3.527z"/>
              </svg>
              Connect Zoom
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-emerald-600 font-bold text-sm">
                <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = `/api/zoom/connect?userId=${userId}`}>
                Reconnect
              </Button>
              <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={handleDisconnectZoom}>
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Microsoft Connection */}
      <Card className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Microsoft Teams & Outlook</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Connect your Microsoft account to generate Teams meetings and check Outlook availability.
            </p>
          </div>
          {!settings.microsoft_refresh_token ? (
            <Button onClick={() => window.location.href = `/api/microsoft/connect?userId=${userId}`}>
              Connect Microsoft
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-emerald-600 font-bold text-sm">
                Connected
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = `/api/microsoft/connect?userId=${userId}`}>
                Reconnect
              </Button>
              <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={handleDisconnectMicrosoft}>
                Disconnect
              </Button>
            </div>
          )}
        </div>
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

      {/* Slack Webhook Settings */}
      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-1">
             <h3 className="text-lg font-semibold text-slate-900">Slack Notifications</h3>
             <p className="text-sm text-slate-500">Paste your Incoming Webhook URL to get instant Slack notifications when a new booking is made.</p>
           </div>
           
           <div className="max-w-xl">
              <Input 
                label="Slack Webhook URL" 
                placeholder="https://hooks.slack.com/services/..."
                value={settings.slack_webhook_url || ''}
                onChange={(e) => setSettings({ ...settings, slack_webhook_url: e.target.value })}
              />
           </div>
           
           <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
             <Button type="submit" disabled={saving}>
               {saving ? 'Saving...' : 'Save Slack Settings'}
             </Button>
           </div>
        </form>
      </Card>

      {/* Payment Settings */}
      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-1">
             <h3 className="text-lg font-semibold text-slate-900">Payment Integrations</h3>
             <p className="text-sm text-slate-500">Configure your payment gateways to charge customers for bookings.</p>
           </div>
           
           <div className="space-y-8">
             <div className="space-y-4">
               <h4 className="font-medium text-slate-800">Stripe</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Stripe Publishable Key" 
                    placeholder="pk_test_..."
                    value={settings.stripe_publishable_key || ''}
                    onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                  />
                  <Input 
                    label="Stripe Secret Key" 
                    type="password"
                    placeholder="sk_test_..."
                    value={settings.stripe_secret_key || ''}
                    onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                  />
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="font-medium text-slate-800">PayPal</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="PayPal Client ID" 
                    placeholder="AbCdEf..."
                    value={settings.paypal_client_id || ''}
                    onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value })}
                  />
                  <Input 
                    label="PayPal Secret" 
                    type="password"
                    placeholder="Secret"
                    value={settings.paypal_secret || ''}
                    onChange={(e) => setSettings({ ...settings, paypal_secret: e.target.value })}
                  />
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="font-medium text-slate-800">Razorpay</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Razorpay Key ID" 
                    placeholder="rzp_test_..."
                    value={settings.razorpay_key_id || ''}
                    onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                  />
                  <Input 
                    label="Razorpay Key Secret" 
                    type="password"
                    placeholder="Secret"
                    value={settings.razorpay_key_secret || ''}
                    onChange={(e) => setSettings({ ...settings, razorpay_key_secret: e.target.value })}
                  />
               </div>
             </div>
           </div>
           
           <div className="pt-4 flex justify-end border-t border-slate-100 mt-6">
             <Button type="submit" disabled={saving}>
               {saving ? 'Saving...' : 'Save Payment Keys'}
             </Button>
           </div>
        </form>
      </Card>

      {/* Admin Reminders */}
      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
           <div className="space-y-1">
             <h3 className="text-lg font-semibold text-slate-900">Admin System Health</h3>
             <p className="text-sm text-slate-500">Receive critical alerts about your account (e.g. Google Calendar token expiration or rotation issues).</p>
           </div>
           
           <div className="max-w-md">
              <Input 
                label="Admin Notification Email" 
                placeholder="personal@email.com"
                value={settings.notification_email || ''}
                onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
              />
              <p className="mt-2 text-xs text-slate-400 italic">
                * This email is only used for system-level alerts and will not be shown to customers.
              </p>
           </div>
           
           <div className="pt-4 flex justify-end border-t border-slate-100">
             <Button type="submit" disabled={saving}>
               {saving ? 'Saving...' : 'Save Admin Alerts'}
             </Button>
           </div>
        </form>
      </Card>
    </div>
  );
}
