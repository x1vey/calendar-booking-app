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
      setSuccessMsg('Email workflow saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError('Error saving: ' + err.message);
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

  return (
    <div className="space-y-10 pb-20">
      {/* Calendar Selector */}
      {initialCalendars.length > 1 && (
        <Card className="p-6 bg-slate-900 border-none shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Target Calendar</label>
            </div>
            <div className="flex flex-wrap gap-3">
              {initialCalendars.map(cal => (
                <button
                  key={cal.id}
                  onClick={() => setActiveCalendarId(cal.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                    activeCalendarId === cal.id
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {cal.name}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Email Workflow</h1>
           <p className="text-sm text-slate-500 font-medium">Manage the sequence of automated emails for this calendar.</p>
        </div>
        <div className="flex items-center gap-3">
           {successMsg && <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-right-2">{successMsg}</span>}
           <Button onClick={handleSave} disabled={saving || loading} size="lg" className="rounded-2xl px-8 bg-indigo-600 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20">
             {saving ? 'Syncing...' : 'Save Workflow'}
           </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm text-rose-700 font-bold">{error}</div>
      )}

      {/* Workflow Sequence */}
      {loading ? (
        <div className="space-y-6">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2rem]" />)}
        </div>
      ) : (
        <div className="space-y-2 relative">
          {/* Vertical Line Connector */}
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100 hidden md:block" />

          {sortedTemplates.map((template, idx) => {
            const meta = templateMeta[template.type] || { label: template.type, description: '', sequence: idx + 1, group: 'Other' };
            const isFirstInGroup = idx === 0 || templateMeta[sortedTemplates[idx-1].type]?.group !== meta.group;

            return (
              <div key={template.id} className="space-y-4">
                {isFirstInGroup && (
                  <div className="pt-8 pb-2">
                    <span className="md:ml-20 px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {meta.group}
                    </span>
                  </div>
                )}
                
                <div className="flex gap-6 group">
                   {/* Sequence Number Bubble */}
                   <div className="hidden md:flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all border-4 ${template.is_active ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg shadow-indigo-600/10' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                         {meta.sequence}
                      </div>
                   </div>

                   <Card className={`flex-1 p-8 rounded-[2rem] transition-all border-2 ${template.is_active ? 'border-transparent shadow-xl ring-1 ring-slate-200/50' : 'border-dashed border-slate-200 bg-slate-50/50 opacity-75'}`}>
                      <div className="flex flex-col lg:flex-row gap-8">
                         {/* Left side: Type & Recipient */}
                         <div className="w-full lg:w-1/3 space-y-4">
                            <div className="flex items-center justify-between">
                               <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">{meta.label}</h3>
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
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{meta.description}</p>
                            
                            {(template.type.includes('reminder') || template.type === 'followup' || template.type === 'review_request') && (
                              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timing:</span>
                                 <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 gap-2 shadow-sm">
                                    <input 
                                       type="number" 
                                       className="w-12 text-xs font-bold text-slate-900 border-none p-0 focus:ring-0 text-center"
                                       value={Math.abs(template.send_offset_minutes)}
                                       onChange={(e) => {
                                         const val = Number(e.target.value);
                                         const newTemplates = [...templates];
                                         const tidx = newTemplates.findIndex(t => t.id === template.id);
                                         newTemplates[tidx].send_offset_minutes = template.type.includes('reminder') ? -val : val;
                                         setTemplates(newTemplates);
                                       }}
                                    />
                                    <span className="text-[10px] font-black text-slate-400">MINS {template.type.includes('reminder') ? 'BEFORE' : 'AFTER'}</span>
                                 </div>
                              </div>
                            )}
                         </div>

                         {/* Right side: Editor */}
                         <div className="flex-1 space-y-4">
                            <Input 
                               label="Subject Line" 
                               value={template.subject}
                               onChange={(e) => {
                                 const newTemplates = [...templates];
                                 const tidx = newTemplates.findIndex(t => t.id === template.id);
                                 newTemplates[tidx].subject = e.target.value;
                                 setTemplates(newTemplates);
                               }}
                               className="font-bold text-slate-900"
                            />
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Body (HTML Supported)</label>
                               <textarea 
                                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none min-h-[160px] font-mono text-[13px] text-slate-700 transition-all placeholder:text-slate-300"
                                  value={template.body_html}
                                  placeholder="Use {{variables}} to inject dynamic data..."
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
                </div>
              </div>
            );
          })}

          {/* Variable Reference Modal-like Card */}
          <div className="md:ml-20 pt-10">
             <Card className="p-8 bg-slate-900 border-none shadow-2xl rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Available Variables</h3>
                <p className="text-slate-400 text-xs font-semibold mb-6 uppercase tracking-widest">Inject these tags into your subjects or bodies:</p>
                <div className="flex flex-wrap gap-2">
                   {['booker_name', 'booker_email', 'calendar_name', 'start_time', 'end_time', 'timezone', 'meet_link', 'cancel_url', 'reschedule_url', 'google_review_url'].map(v => (
                     <code key={v} className="bg-slate-800 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700">
                        {`{{${v}}}`}
                     </code>
                   ))}
                </div>
             </Card>
          </div>

          {/* Bottom Save Button (Floating-ish) */}
          <div className="md:ml-20 pt-8 flex justify-end items-center gap-6">
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Changes are NOT saved until you click sync</p>
             <Button onClick={handleSave} disabled={saving || loading} size="lg" className="rounded-2xl px-12 h-16 bg-indigo-600 font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all">
                {saving ? 'Synchronizing Pipeline...' : 'Save Workflow'}
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
