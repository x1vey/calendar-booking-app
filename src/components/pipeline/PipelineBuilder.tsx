'use client';

import React, { useState } from 'react';
import { EmailPipeline, EmailPipelineStep, EmailTemplate, PipelineStepType } from '@/lib/types';
import { TriggerNode, EmailNode, WaitNode, VerticalConnector } from './PipelineNode';
import AddStepButton from './AddStepButton';
import EmailPreviewPanel from './EmailPreviewPanel';
import { Card } from '@/components/ui/Card';

interface PipelineBuilderProps {
  pipeline: EmailPipeline;
  templates: EmailTemplate[];
  calendarId: string;
  calendarName: string;
  onUpdatePipeline: (pipeline: EmailPipeline) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<EmailTemplate>) => void;
}

export default function PipelineBuilder({
  pipeline,
  templates,
  calendarId,
  calendarName,
  onUpdatePipeline,
  onUpdateTemplate,
}: PipelineBuilderProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const steps = pipeline.steps || [];

  const selectedStep = selectedStepIndex !== null ? steps[selectedStepIndex] : null;
  const selectedTemplate = selectedStep?.step_type === 'send_email'
    ? templates.find(t => t.id === selectedStep.email_template_id) || null
    : null;

  const updateSteps = (newSteps: EmailPipelineStep[]) => {
    onUpdatePipeline({
      ...pipeline,
      steps: newSteps.map((s, i) => ({ ...s, step_order: i })),
    });
  };

  const insertStep = (atIndex: number, type: PipelineStepType) => {
    const newStep: EmailPipelineStep = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      pipeline_id: pipeline.id,
      step_order: atIndex,
      step_type: type,
      email_template_id: null,
      wait_duration_minutes: type === 'wait' ? 60 : null,
      wait_anchor: type === 'wait' ? 'after_previous' : null,
      created_at: new Date().toISOString(),
    };
    const newSteps = [...steps];
    newSteps.splice(atIndex, 0, newStep);
    updateSteps(newSteps);
  };

  const deleteStep = (index: number) => {
    if (selectedStepIndex === index) setSelectedStepIndex(null);
    else if (selectedStepIndex !== null && selectedStepIndex > index) {
      setSelectedStepIndex(selectedStepIndex - 1);
    }
    const newSteps = steps.filter((_, i) => i !== index);
    updateSteps(newSteps);
  };

  const updateStep = (index: number, updates: Partial<EmailPipelineStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    updateSteps(newSteps);
  };

  return (
    <div className="flex gap-8">
      {/* Left: Flowchart */}
      <div className="flex-1 flex flex-col items-center py-4">
        {/* Pipeline active toggle */}
        <div className="w-full max-w-sm mb-4 flex items-center justify-between px-1">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={pipeline.is_active}
              onChange={(e) => onUpdatePipeline({ ...pipeline, is_active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            Pipeline Active
          </label>
          <span className={`text-xs font-bold ${pipeline.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
            {pipeline.is_active ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Trigger node */}
        <TriggerNode trigger={pipeline.trigger_event} />
        <VerticalConnector />

        {/* Steps */}
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <AddStepButton onAdd={(type) => insertStep(index, type)} />
            <VerticalConnector />

            {step.step_type === 'send_email' ? (
              <EmailNode
                step={step}
                templates={templates}
                isSelected={selectedStepIndex === index}
                onSelect={() => setSelectedStepIndex(selectedStepIndex === index ? null : index)}
                onChangeTemplate={(templateId) => {
                  updateStep(index, {
                    email_template_id: templateId || null,
                    email_template: templates.find(t => t.id === templateId),
                  });
                }}
                onDelete={() => deleteStep(index)}
              />
            ) : (
              <WaitNode
                step={step}
                onUpdate={(updates) => updateStep(index, updates)}
                onDelete={() => deleteStep(index)}
              />
            )}

            <VerticalConnector />
          </React.Fragment>
        ))}

        {/* Add step at end */}
        <AddStepButton onAdd={(type) => insertStep(steps.length, type)} />

        {/* End node */}
        <VerticalConnector />
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 max-w-sm w-full justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-500">End of Pipeline</span>
        </div>
      </div>

      {/* Right: Email preview panel */}
      {selectedTemplate && (
        <div className="w-[420px] shrink-0">
          <Card className="p-6 sticky top-4">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Edit Template</h3>
            <EmailPreviewPanel
              template={selectedTemplate}
              calendarId={calendarId}
              calendarName={calendarName}
              onUpdateTemplate={(updates) => onUpdateTemplate(selectedTemplate.id, updates)}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
