'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { renderTemplate, sampleVariables } from '@/lib/template-utils';
import { EmailTemplate } from '@/lib/types';
import TestEmailDialog from './TestEmailDialog';

interface EmailPreviewPanelProps {
  template: EmailTemplate;
  calendarId: string;
  calendarName: string;
  onUpdateTemplate: (updates: Partial<EmailTemplate>) => void;
}

export default function EmailPreviewPanel({
  template,
  calendarId,
  calendarName,
  onUpdateTemplate,
}: EmailPreviewPanelProps) {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const variables = useMemo(() => ({
    ...sampleVariables,
    calendar_name: calendarName,
  }), [calendarName]);

  const renderedSubject = useMemo(
    () => renderTemplate(template.subject, variables),
    [template.subject, variables]
  );
  const renderedHtml = useMemo(
    () => renderTemplate(template.body_html, variables),
    [template.body_html, variables]
  );

  return (
    <div className="space-y-4">
      {/* Subject */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Subject Line</label>
        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          value={template.subject}
          onChange={(e) => onUpdateTemplate({ subject: e.target.value })}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          HTML Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Content */}
      {activeTab === 'edit' ? (
        <div className="space-y-1.5">
          <textarea
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[300px] font-mono text-[13px]"
            value={template.body_html}
            onChange={(e) => onUpdateTemplate({ body_html: e.target.value })}
          />
          <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-500 border border-slate-100">
            <p className="font-semibold mb-1">Available Variables:</p>
            <p className="font-mono">{`{{booker_name}}, {{booker_email}}, {{calendar_name}}, {{start_time}}, {{end_time}}, {{timezone}}, {{meet_link}}, {{cancel_url}}, {{reschedule_url}}, {{google_review_url}}`}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-400 font-medium mb-1">Subject:</p>
            <p className="text-sm font-medium text-slate-900">{renderedSubject}</p>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={renderedHtml}
              sandbox=""
              className="w-full min-h-[300px] border-0"
              title="Email preview"
            />
          </div>
        </div>
      )}

      {/* Active toggle + actions */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={template.is_active}
            onChange={(e) => onUpdateTemplate({ is_active: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          Active
        </label>
        <Button variant="outline" size="sm" onClick={() => setTestDialogOpen(true)}>
          Send Test Email
        </Button>
      </div>

      <TestEmailDialog
        isOpen={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        calendarId={calendarId}
        templateId={template.id}
      />
    </div>
  );
}
