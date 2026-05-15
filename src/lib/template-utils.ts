export function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(placeholder, value || '');
  }
  return rendered;
}

export const sampleVariables: Record<string, string> = {
  booker_name: 'Jane Doe',
  booker_email: 'jane@example.com',
  calendar_name: 'Strategy Call',
  start_time: 'Monday, January 15, 2026 at 2:00 PM',
  end_time: 'Monday, January 15, 2026 at 2:30 PM',
  timezone: 'America/New_York',
  meet_link: 'https://meet.google.com/abc-defg-hij',
  cancel_url: 'https://yourdomain.com/cancel/sample-token',
  reschedule_url: 'https://yourdomain.com/reschedule/sample-token',
  google_review_url: 'https://g.page/review/sample',
};
