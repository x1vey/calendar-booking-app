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

  const templateMeta: Record<string, { label: string; description: string; sequence: number; group: string }> = {
    confirmation: { sequence: 1, group: 'On Booking', label: 'Client: Booking Confirmation', description: 'Sent immediately to the booker.' },
    user_booking_alert: { sequence: 2, group: 'On Booking', label: 'Host: New Booking Alert', description: 'Sent immediately to you when someone books.' },
    reschedule_confirmation: { sequence: 3, group: 'On Reschedule', label: 'Client: Reschedule Confirmation', description: 'Sent when the booker changes the time.' },
    user_reschedule_alert: { sequence: 4, group: 'On Reschedule', label: 'Host: Reschedule Alert', description: 'Sent to you when a booking is rescheduled.' },
    cancellation: { sequence: 5, group: 'On Cancellation', label: 'Client: Cancellation', description: 'Sent immediately if a booking is cancelled.' },
    client_reminder_1d: { sequence: 6, group: 'Reminders', label: 'Client: 1-Day Reminder', description: 'Sent to the booker 24 hours before.' },
    client_reminder_5m: { sequence: 7, group: 'Reminders', label: 'Client: 5-Min Reminder', description: 'Sent to the booker 5 minutes before.' },
    user_reminder_5m: { sequence: 8, group: 'Reminders', label: 'Host: 5-Min Reminder', description: 'Sent to you 5 minutes before.' },
    followup: { sequence: 9, group: 'After Meeting', label: 'Follow-Up', description: 'Sent after the session ends.' },
    review_request: { sequence: 10, group: 'After Meeting', label: 'Review Request', description: 'Sent after meeting to request a review.' },
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    const seqA = templateMeta[a.type]?.sequence || 99;
    const seqB = templateMeta[b.type]?.sequence || 99;
    return seqA - seqB;
  });

  if (loading) return <div className="p-8 text-center text-slate-500 italic">Loading email settings...</div>;
  if (error) return <div className="p-8 text-center text-rose-500 font-medium">Error: {error}</div>;

  return (
    <div className="space-y-12">
      {/* Provider Config */}
      <Card className="p-10 space-y-10 rounded-[2.5rem] shadow-xl border-none ring-1 ring-slate-200/50">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Email Provider</h3>
          <p className="text-sm text-slate-500 font-medium">Choose how the app sends notifications to your bookers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <button
             onClick={() => onUpdate({ ...calendar, email_provider: 'resend' })}
             className={`flex flex-col items-center p-6 rounded-[2rem] border-4 transition-all ${calendar.email_provider === 'resend' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/10' : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50/50'}`}
           >
             <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
               <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
             </div>
             <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Resend</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">System Default</span>
           </button>

           <button
             onClick={() => onUpdate({ ...calendar, email_provider: 'google_smtp' })}
             className={`flex flex-col items-center p-6 rounded-[2rem] border-4 transition-all ${calendar.email_provider === 'google_smtp' ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-600/10' : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50/50'}`}
           >
             <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
               <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
             </div>
             <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Google SMTP</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Your Gmail Account</span>
           </button>
        </div>

        {calendar.email_provider === 'google_smtp' && (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
             <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-black uppercase tracking-widest text-slate-900">Security Requirement</p>
                  <p>1. Enable 2-Step Verification on Google.</p>
                  <p>2. Create an <strong className="text-indigo-600">App Password</strong> in your Google Account Security settings.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Gmail/Workspace Email"
                  placeholder="name@company.com"
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

      {/* Templates Sequence */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Email Workflow</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Sequence of automation</p>
           </div>
        </div>

        <div className="space-y-4">
          {sortedTemplates.map((template, idx) => {
            const meta = templateMeta[template.type] || { label: template.type, description: '', sequence: idx + 1, group: 'Other' };
            return (
              <Card key={template.type} className={`p-8 rounded-[2rem] border-2 transition-all ${template.is_active ? 'border-transparent shadow-lg ring-1 ring-slate-200/50' : 'border-dashed border-slate-100 opacity-60 grayscale bg-slate-50/50'}`}>
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-1/3 space-y-5">
                    <div className="flex items-center justify-between">
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">#{meta.sequence}</span>
                       <input
                          type="checkbox"
                          checked={template.is_active}
                          onChange={(e) => {
                             const newTemplates = [...templates];
                             const tidx = newTemplates.findIndex(t => t.id === template.id);
                             newTemplates[tidx].is_active = e.target.checked;
                             setTemplates(newTemplates);
                          }}
                          className="w-5 h-5 text-indigo-600 rounded-lg border-slate-200 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{meta.label}</h4>
                       <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-1 uppercase tracking-wider">{meta.description}</p>
                    </div>

                    {(template.type.includes('reminder') || template.type === 'followup' || template.type === 'review_request') && (
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing:</span>
                         <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
                            <input 
                               type="number" 
                               className="w-12 text-xs font-bold text-slate-900 border-none bg-transparent p-0 focus:ring-0 text-center"
                               value={Math.abs(template.send_offset_minutes)}
                               onChange={(e) => {
                                 const val = Number(e.target.value);
                                 const newTemplates = [...templates];
                                 const tidx = newTemplates.findIndex(t => t.id === template.id);
                                 newTemplates[tidx].send_offset_minutes = template.type.includes('reminder') ? -val : val;
                                 setTemplates(newTemplates);
                               }}
                            />
                            <span className="text-[9px] font-black text-slate-400">MINS</span>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <Input
                       label="Subject Line"
                       value={template.subject}
                       className="font-bold"
                       onChange={(e) => {
                         const newTemplates = [...templates];
                         const tidx = newTemplates.findIndex(t => t.id === template.id);
                         newTemplates[tidx].subject = e.target.value;
                         setTemplates(newTemplates);
                       }}
                    />
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Content</label>
                       <textarea
                         className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none min-h-[140px] font-mono text-slate-700"
                         value={template.body_html}
                         onChange={(e) => {
                           const newTemplates = [...templates];
                           const tidx = newTemplates.findIndex(t => t.id === template.id);
                           newTemplates[tidx].body_html = e.target.value;
                           setTemplates(newTemplates);
                         }}
                       />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="pt-10 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-2xl px-12 h-16 bg-indigo-600 font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30">
             {saving ? 'Syncing Workflow...' : 'Save All Email Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
