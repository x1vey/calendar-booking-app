'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TestEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
  templateId: string;
}

export default function TestEmailDialog({ isOpen, onClose, calendarId, templateId }: TestEmailDialogProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId, templateId, recipientEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setResult({ success: true });
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Test Email">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">
          Send this template with sample data to check how it looks in a real inbox.
        </p>
        <Input
          label="Recipient Email"
          type="email"
          placeholder="test@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {result?.success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            Test email sent successfully!
          </div>
        )}
        {result?.error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
            {result.error}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !email}>
            {sending ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
