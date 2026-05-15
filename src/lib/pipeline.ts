import { addMinutes } from 'date-fns';
import { EmailPipelineStep } from './types';

export function calculateExecutionSchedule(
  steps: EmailPipelineStep[],
  triggerTime: Date,
  eventStartTime: Date
): { stepId: string; status: string; scheduledAt: string }[] {
  const sorted = [...steps].sort((a, b) => a.step_order - b.step_order);
  const results: { stepId: string; status: string; scheduledAt: string }[] = [];
  let cursor = triggerTime;

  for (const step of sorted) {
    if (step.step_type === 'wait') {
      if (step.wait_anchor === 'before_event' && step.wait_duration_minutes) {
        cursor = addMinutes(eventStartTime, -step.wait_duration_minutes);
      } else if (step.wait_anchor === 'after_previous' && step.wait_duration_minutes) {
        cursor = addMinutes(cursor, step.wait_duration_minutes);
      }
      results.push({
        stepId: step.id,
        status: 'waiting',
        scheduledAt: cursor.toISOString(),
      });
    } else if (step.step_type === 'send_email') {
      results.push({
        stepId: step.id,
        status: 'pending',
        scheduledAt: cursor.toISOString(),
      });
    }
  }

  return results;
}
