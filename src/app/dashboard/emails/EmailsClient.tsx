'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmailPipeline, EmailTemplate } from '@/lib/types';
import PipelineBuilder from '@/components/pipeline/PipelineBuilder';

interface CalendarInfo {
  id: string;
  name: string;
}

export default function EmailsClient({ initialCalendars }: { initialCalendars: CalendarInfo[] }) {
  const [activeCalendarId, setActiveCalendarId] = useState(initialCalendars[0]?.id || '');
  const [activeCalendar, setActiveCalendar] = useState<CalendarInfo | null>(initialCalendars[0] || null);
  const [pipelines, setPipelines] = useState<EmailPipeline[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'booking_confirmed' | 'booking_cancelled'>('booking_confirmed');

  const fetchData = useCallback(async () => {
    if (!activeCalendarId) return;
    setLoading(true);
    setError(null);

    try {
      const [pipelinesRes, templatesRes] = await Promise.all([
        fetch(`/api/admin/pipelines/${activeCalendarId}`),
        fetch(`/api/admin/email-templates/${activeCalendarId}`),
      ]);

      const pipelinesData = await pipelinesRes.json();
      const templatesData = await templatesRes.json();

      if (Array.isArray(pipelinesData)) setPipelines(pipelinesData);
      else setError(pipelinesData.error || 'Failed to load pipelines');

      if (Array.isArray(templatesData)) setTemplates(templatesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [activeCalendarId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const cal = initialCalendars.find(c => c.id === activeCalendarId);
    setActiveCalendar(cal || null);
  }, [activeCalendarId, initialCalendars]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const pipelineRes = await fetch(`/api/admin/pipelines/${activeCalendarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pipelines),
      });
      if (!pipelineRes.ok) {
        const data = await pipelineRes.json();
        throw new Error(data.error || 'Failed to save pipelines');
      }

      const templateRes = await fetch(`/api/admin/email-templates/${activeCalendarId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templates),
      });
      if (!templateRes.ok) {
        const data = await templateRes.json();
        throw new Error(data.error || 'Failed to save templates');
      }

      setSuccessMsg('Pipeline and templates saved!');
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchData();
    } catch (err: any) {
      setError('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updatePipeline = (updatedPipeline: EmailPipeline) => {
    setPipelines(prev => prev.map(p =>
      p.id === updatedPipeline.id ? updatedPipeline : p
    ));
  };

  const updateTemplate = (templateId: string, updates: Partial<EmailTemplate>) => {
    setTemplates(prev => prev.map(t =>
      t.id === templateId ? { ...t, ...updates } : t
    ));
  };

  const activePipeline = pipelines.find(p => p.trigger_event === activeTab);

  return (
    <div className="space-y-6">
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

      {/* Status messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-sm text-rose-700 font-bold">{error}</div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-bold flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Pipeline Tabs */}
      {!loading && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('booking_confirmed')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'booking_confirmed'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Booking Confirmed
            </span>
          </button>
          <button
            onClick={() => setActiveTab('booking_cancelled')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'booking_cancelled'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Booking Cancelled
            </span>
          </button>
        </div>
      )}

      {/* Pipeline Builder */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />)}
        </div>
      ) : activePipeline ? (
        <div className="space-y-6">
          <PipelineBuilder
            pipeline={activePipeline}
            templates={templates}
            calendarId={activeCalendarId}
            calendarName={activeCalendar?.name || ''}
            onUpdatePipeline={updatePipeline}
            onUpdateTemplate={updateTemplate}
          />

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-2xl px-8 bg-indigo-600 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-indigo-600/20">
              {saving ? 'Saving...' : 'Save Pipeline & Templates'}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No pipeline configured</h3>
          <p className="text-slate-500 text-sm">Pipelines will be auto-created when you reload this page.</p>
        </Card>
      )}
    </div>
  );
}
