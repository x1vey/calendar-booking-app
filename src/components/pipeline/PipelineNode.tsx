'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { EmailPipelineStep, EmailTemplate, PipelineTrigger, WaitAnchor } from '@/lib/types';

interface TriggerNodeProps {
  trigger: PipelineTrigger;
}

export function TriggerNode({ trigger }: TriggerNodeProps) {
  const isConfirmed = trigger === 'booking_confirmed';
  const label = isConfirmed ? 'Booking Confirmed' : 'Booking Cancelled';

  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 w-full max-w-sm ${
      isConfirmed ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isConfirmed ? 'bg-emerald-100' : 'bg-rose-100'
      }`}>
        {isConfirmed ? (
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <div>
        <p className={`text-sm font-bold ${isConfirmed ? 'text-emerald-800' : 'text-rose-800'}`}>Trigger</p>
        <p className={`text-xs ${isConfirmed ? 'text-emerald-600' : 'text-rose-600'}`}>{label}</p>
      </div>
    </div>
  );
}

interface EmailNodeProps {
  step: EmailPipelineStep;
  templates: EmailTemplate[];
  isSelected: boolean;
  onSelect: () => void;
  onChangeTemplate: (templateId: string) => void;
  onDelete: () => void;
}

export function EmailNode({ step, templates, isSelected, onSelect, onChangeTemplate, onDelete }: EmailNodeProps) {
  const template = step.email_template || templates.find(t => t.id === step.email_template_id);

  const typeLabels: Record<string, string> = {
    confirmation: 'Booking Confirmation',
    user_booking_alert: 'Host: New Booking Alert',
    client_reminder_1d: '24-Hour Reminder',
    client_reminder_5m: '5-Min Reminder',
    user_reminder_5m: 'Host: 5-Min Reminder',
    cancellation: 'Cancellation Notice',
    reminder: 'Reminder',
    followup: 'Follow-Up',
    reschedule_confirmation: 'Reschedule Confirmation',
    user_reschedule_alert: 'Host: Reschedule Alert',
    review_request: 'Review Request',
  };

  return (
    <Card
      className={`w-full max-w-sm cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : 'hover:border-slate-300'
      }`}
      onClick={onSelect}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">Send Email</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <select
          value={step.email_template_id || ''}
          onChange={(e) => { e.stopPropagation(); onChangeTemplate(e.target.value); }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Select template...</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>
              {typeLabels[t.type] || t.type} — {t.subject}
            </option>
          ))}
        </select>

        {template && (
          <p className="text-xs text-slate-500 truncate">
            {typeLabels[template.type] || template.type}
            {template.is_active ? '' : ' (disabled)'}
          </p>
        )}
      </div>
    </Card>
  );
}

interface WaitNodeProps {
  step: EmailPipelineStep;
  onUpdate: (updates: Partial<EmailPipelineStep>) => void;
  onDelete: () => void;
}

export function WaitNode({ step, onUpdate, onDelete }: WaitNodeProps) {
  const minutes = step.wait_duration_minutes || 0;
  const anchor = step.wait_anchor || 'after_previous';

  let displayValue = minutes;
  let displayUnit: 'minutes' | 'hours' | 'days' = 'minutes';
  if (minutes >= 1440 && minutes % 1440 === 0) {
    displayValue = minutes / 1440;
    displayUnit = 'days';
  } else if (minutes >= 60 && minutes % 60 === 0) {
    displayValue = minutes / 60;
    displayUnit = 'hours';
  }

  const handleValueChange = (val: number, unit: string) => {
    let mins = val;
    if (unit === 'hours') mins = val * 60;
    if (unit === 'days') mins = val * 1440;
    onUpdate({ wait_duration_minutes: mins });
  };

  return (
    <Card className="w-full max-w-sm">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">Wait</span>
          </div>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={displayValue}
            onChange={(e) => handleValueChange(Number(e.target.value), displayUnit)}
            className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={displayUnit}
            onChange={(e) => handleValueChange(displayValue, e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="minutes">minutes</option>
            <option value="hours">hours</option>
            <option value="days">days</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onUpdate({ wait_anchor: 'after_previous' as WaitAnchor })}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              anchor === 'after_previous'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            After previous step
          </button>
          <button
            onClick={() => onUpdate({ wait_anchor: 'before_event' as WaitAnchor })}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              anchor === 'before_event'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            Before event starts
          </button>
        </div>
      </div>
    </Card>
  );
}

export function VerticalConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="w-0.5 h-6 bg-slate-300" />
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-300" />
    </div>
  );
}
