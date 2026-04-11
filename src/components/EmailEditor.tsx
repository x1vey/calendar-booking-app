'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar, EmailTemplate } from '@/lib/types';

export default function EmailEditor({ calendar, onUpdate }: { calendar: Calendar, onUpdate: (c: Calendar) => void }) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch(`/api/admin/email-templates/${calendar.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTemplates(data);
        } else if (data.error) {
          setError(data.error);
          setTemplates([]);
        } else {
          setError('Failed to load templates');
          setTemplates([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch templates');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, [calendar.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update calendar provider settings
      await fetch(`/api/admin/calendars/${calendar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_provider: calendar.email_provider,
          smtp_user: calendar.smtp_user,
          smtp_pass: calendar.smtp_pass,
        }),
      });

      // 2. Update templates
      await fetch(`/api/admin/email-templates/${calendar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });

      alert('Email settings saved successfully!');
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 italic">Loading email settings...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-medium">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Provider Config */}
      <Card className="p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Email Provider</h3>
          <p className="text-sm text-slate-500">Choose how the app sends notifications to your bookers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <button
             onClick={() => onUpdate({ ...calendar, email_provider: 'resend' })}
             className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${calendar.email_provider === 'resend' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
           >
             <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
               <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
             </div>
             <span className="font-semibold text-sm">Resend</span>
             <span className="text-xs text-slate-500">Fast, reliable API (System Default)</span>
           </button>

           <button
             onClick={() => onUpdate({ ...calendar, email_provider: 'google_smtp' })}
             className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${calendar.email_provider === 'google_smtp' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
           >
             <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
               <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
             </div>
             <span className="font-semibold text-sm">Google SMTP</span>
             <span className="text-xs text-slate-500">Use your own Gmail/Workspace account</span>
           </button>
        </div>

        {calendar.email_provider === 'google_smtp' && (
          <div className="pt-4 space-y-4 border-t border-slate-100">
             <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 flex items-start space-x-3">
                <svg className="w-5 h-5 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-xs text-indigo-800">
                  <p className="font-semibold mb-1">How to use Google SMTP:</p>
                  <p>1. Enable 2-Step Verification on your Google account.</p>
                  <p>2. Generate an <strong>App Password</strong> (usually under Security settings).</p>
                  <p>3. Use that 16-character code as the password below.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Gmail/Workspace Email"
                  placeholder="your-email@company.com"
                  value={calendar.smtp_user || ''}
                  onChange={(e) => onUpdate({ ...calendar, smtp_user: e.target.value })}
                />
                <Input
                  label="App Password"
                  type="password"
                  placeholder="xxxx xxxx xxxx xxxx"
                  value={calendar.smtp_pass || ''}
                  onChange={(e) => onUpdate({ ...calendar, smtp_pass: e.target.value })}
                />
             </div>
          </div>
        )}
      </Card>

      {/* Templates */}
      <Card className="p-8 space-y-8">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Email Templates</h3>
          <p className="text-sm text-slate-500">Customize the emails sent automatically at each step. Use <code>{`{{variables}}`}</code> to inject dynamic data.</p>
        </div>

        <div className="space-y-12">
          {templates.map((template, idx) => (
            <div key={template.type} className="space-y-4 pt-8 border-t border-slate-100 first:border-0 first:pt-0">
               <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">{template.type}</h4>
                  <div className="flex items-center space-x-2">
                     <span className="text-xs text-slate-500 font-medium">{template.is_active ? 'Active' : 'Disabled'}</span>
                     <input
                        type="checkbox"
                        checked={template.is_active}
                        onChange={(e) => {
                           const newTemplates = [...templates];
                           newTemplates[idx].is_active = e.target.checked;
                           setTemplates(newTemplates);
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                  </div>
               </div>
               
               <Input
                  label="Subject Line"
                  value={template.subject}
                  onChange={(e) => {
                    const newTemplates = [...templates];
                    newTemplates[idx].subject = e.target.value;
                    setTemplates(newTemplates);
                  }}
               />

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email Content (HTML)</label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[150px] font-mono text-[13px]"
                    value={template.body_html}
                    onChange={(e) => {
                      const newTemplates = [...templates];
                      newTemplates[idx].body_html = e.target.value;
                      setTemplates(newTemplates);
                    }}
                  />
               </div>

               {(template.type === 'reminder' || template.type === 'followup') && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                     <span>Send</span>
                     <input
                        type="number"
                        className="w-20 rounded border-slate-200 text-sm px-2 py-1"
                        value={Math.abs(template.send_offset_minutes)}
                        onChange={(e) => {
                           const val = Number(e.target.value);
                           const newTemplates = [...templates];
                           newTemplates[idx].send_offset_minutes = template.type === 'reminder' ? -val : val;
                           setTemplates(newTemplates);
                        }}
                     />
                     <span>minutes {template.type === 'reminder' ? 'before' : 'after'} the session.</span>
                  </div>
               )}
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="p-4 rounded-lg bg-slate-50 text-xs text-slate-500">
             <p className="font-semibold mb-1 uppercase">Available Variables:</p>
             <p className="font-mono">{`{{booker_name}}, {{booker_email}}, {{calendar_name}}, {{start_time}}, {{end_time}}, {{timezone}}, {{meet_link}}, {{cancel_url}}`}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
           {saving ? 'Saving all settings...' : 'Save All Email Settings'}
        </Button>
      </div>
    </div>
  );
}
