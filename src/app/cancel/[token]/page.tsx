'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

export default function CancellationPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [status, setStatus] = useState<'view' | 'success' | 'error'>('view');
  
  // Mock data for demo
  const booking = {
    calendar_name: 'General Consultation',
    start_time: '2024-10-12T10:00:00Z',
    booker_name: 'John Doe',
  };

  useEffect(() => {
    // Verify token here
    setTimeout(() => setLoading(false), 1000);
  }, [token]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch (err) {
      setStatus('error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Checking link...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 text-slate-900">
      <Card className="w-full max-w-lg p-8 space-y-8 shadow-xl ring-1 ring-slate-200">
        {status === 'view' && (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Cancel Booking?</h1>
              <p className="text-slate-500">Are you sure you want to cancel your session with {booking.calendar_name}?</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl space-y-3 border border-slate-100">
               <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-widest">When</span>
                  <span className="font-medium">{format(new Date(booking.start_time), 'EEEE, MMM d @ h:mm a')}</span>
               </div>
               <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-widest">Who</span>
                  <span className="font-medium">{booking.booker_name}</span>
               </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="danger" 
                className="w-full" 
                size="lg" 
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel this booking'}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-slate-400" 
                onClick={() => window.history.back()}
              >
                Nevermind, keep it
              </Button>
            </div>
          </>
        )}

        {status === 'success' && (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Booking Cancelled</h2>
              <p className="text-slate-500 text-sm">Your session has been successfully removed from our schedule. You can now close this window.</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-6 py-8">
             <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </div>
             <div className="space-y-2">
                <h2 className="text-xl font-bold">Oops!</h2>
                <p className="text-slate-500 text-sm">Something went wrong or this cancellation link is invalid/expired.</p>
             </div>
             <Button variant="outline" onClick={() => setStatus('view')}>Try Again</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
