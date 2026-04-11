'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body_html: string;
  send_offset_minutes: number;
  is_active: boolean;
}

export default function EmailsClient({ initialCalendars }: { initialCalendars: any[] }) {
  const [activeCalendarId, setActiveCalendarId] = useState(initialCalendars[0]?.id || '');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch templates whenever the selected calendar changes
  useEffect(() => {
    if (!activeCalendarId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/admin/email-templates/${activeCalendarId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
        } else if (data.error) {
          setError(data.error);
          setTemplates([]);
        } else {
          setError('Failed to load templates');
          setTemplates([]);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch templates');
        setTemplates([]);
      })
      .finally(() => setLoading(false));
  }, [activeCalendarId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/email-templates/${activeCalendarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSuccessMsg('Email templates saved!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const templateLabels: Record<string, { label: string; description: string }> = {
    confirmation: { label: 'Client: Booking Confirmation', description: 'Sent immediately to the booker.' },
    user_booking_alert: { label: 'Host: New Booking Alert', description: 'Sent immediately to you when someone books.' },
    client_reminder_1d: { label: 'Client: 1-Day Reminder', description: 'Sent to the booker 24 hours before the session.' },
    client_reminder_5m: { label: 'Client: 5-Min Reminder', description: 'Sent to the booker 5 minutes before the session.' },
    user_reminder_5m: { label: 'Host: 5-Min Reminder', description: 'Sent to you 5 minutes before the session.' },
    cancellation: { label: 'Client: Cancellation', description: 'Sent immediately if a booking is cancelled.' },
    reminder: { label: 'Legacy Reminder', description: 'Old reminder format (replaced by pipeline).' },
    followup: { label: 'Follow-Up', description: 'Sent after the session ends.' },
  };

  return (
    <div className="space-y-6">
      {/* Calendar Selector */}
      {initialCalendars.length > 1 && (
        <Card className="p-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Calendar</label>
            <div className="flex flex-wrap gap-2">
              {initialCalendars.map(cal => (
                <button
                  key={cal.id}
                  onClick={() => setActiveCalendarId(cal.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    activeCalendarId === cal.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cal.name}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Status messages */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">{error}</div>
      )}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          {successMsg}
        </div>
      )}

      {/* Templates List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />)}
        </div>
      ) : templates.length === 0 && !error ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No templates configured</h3>
          <p className="text-slate-500 text-sm">Email templates for this calendar have not been set up yet. They will be auto-created when the calendar is first used.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {templates.map((template, idx) => {
            const meta = templateLabels[template.type] || { label: template.type, description: '' };
            return (
              <Card key={template.id || idx} className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{meta.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{meta.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${template.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {template.is_active ? 'Active' : 'Disabled'}
                    </span>
                    <input
                      type="checkbox"
                      checked={template.is_active}
                      onChange={(e) => {
                        const newTemplates = [...templates];
                        newTemplates[idx] = { ...newTemplates[idx], is_active: e.target.checked };
                        setTemplates(newTemplates);
                      }}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Subject Line"
                    value={template.subject}
                    onChange={(e) => {
                      const newTemplates = [...templates];
                      newTemplates[idx] = { ...newTemplates[idx], subject: e.target.value };
                      setTemplates(newTemplates);
                    }}
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email Body (HTML)</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px] font-mono text-[13px]"
                      value={template.body_html}
                      onChange={(e) => {
                        const newTemplates = [...templates];
                        newTemplates[idx] = { ...newTemplates[idx], body_html: e.target.value };
                        setTemplates(newTemplates);
                      }}
                    />
                  </div>

                  {(template.type === 'reminder' || template.type === 'followup') && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <span>Send</span>
                      <input
                        type="number"
                        className="w-20 rounded border border-slate-200 text-sm px-2 py-1"
                        value={Math.abs(template.send_offset_minutes)}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const newTemplates = [...templates];
                          newTemplates[idx] = {
                            ...newTemplates[idx],
                            send_offset_minutes: template.type === 'reminder' ? -val : val,
                          };
                          setTemplates(newTemplates);
                        }}
                      />
                      <span>minutes {template.type === 'reminder' ? 'before' : 'after'} the session.</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Variables Reference */}
          <div className="p-4 rounded-lg bg-slate-50 text-xs text-slate-500 border border-slate-100">
            <p className="font-semibold mb-1 uppercase">Available Variables:</p>
            <p className="font-mono">{`{{booker_name}}, {{booker_email}}, {{calendar_name}}, {{start_time}}, {{end_time}}, {{timezone}}, {{meet_link}}, {{cancel_url}}`}</p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? 'Saving...' : 'Save Email Templates'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
